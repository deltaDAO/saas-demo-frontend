import axios, { AxiosResponse, CancelToken } from 'axios'
import { Asset } from '@oceanprotocol/lib'
import { SortDirectionOptions } from '../types/aquarius/SearchQuery'
import { NETWORKS_BY_ID } from './chains'

/**
 * @param filterField the name of the actual field from the ddo schema e.g. 'id','service.attributes.main.type'
 * @param value the value of the filter
 * @returns json structure of the es filter
 */
type TFilterValue = string | number | boolean | number[] | string[]
type TFilterKey = 'terms' | 'term' | 'match' | 'match_phrase'

export function getFilterTerm(
  filterField: string,
  value: TFilterValue,
  key: TFilterKey = 'term'
): FilterTerm {
  const isArray = Array.isArray(value)
  const useKey = key === 'term' ? (isArray ? 'terms' : 'term') : key
  return {
    [useKey]: {
      [filterField]: value
    }
  }
}

export function generateBaseQuery(
  baseQueryParams: BaseQueryParams
): SearchQuery {
  const generatedQuery = {
    from: baseQueryParams.esPaginationOptions?.from || 0,
    size:
      baseQueryParams.esPaginationOptions?.size >= 0
        ? baseQueryParams.esPaginationOptions?.size
        : 1000,
    query: {
      bool: {
        ...baseQueryParams.nestedQuery,
        filter: [
          ...(baseQueryParams.filters || []),
          ...(baseQueryParams.chainIds
            ? [getFilterTerm('chainId', baseQueryParams.chainIds)]
            : []),
          getFilterTerm('_index', 'v510'),
          getFilterTerm('purgatory.state', false),
          {
            exists: {
              field: 'metadata.additionalInformation.saas.redirectUrl'
            }
          },
          {
            bool: {
              must_not: [getFilterTerm('price.type', 'pool')]
            }
          }
        ]
      }
    }
  } as SearchQuery

  if (baseQueryParams.aggs !== undefined) {
    generatedQuery.aggs = baseQueryParams.aggs
  }

  if (baseQueryParams.sortOptions !== undefined)
    generatedQuery.sort = {
      [baseQueryParams.sortOptions.sortBy]:
        baseQueryParams.sortOptions.sortDirection ||
        SortDirectionOptions.Descending
    }

  return generatedQuery
}

export async function queryMetadata(
  query: SearchQuery,
  cancelToken: CancelToken
): Promise<Asset[]> {
  try {
    const response: AxiosResponse<SearchResponse> = await axios.post(
      `${process.env.NEXT_PUBLIC_METADATACACHE_URI}/api/aquarius/assets/query`,
      { ...query },
      { cancelToken }
    )
    if (!response || response.status !== 200 || !response.data) return

    return (response.data?.hits?.hits || []).map((hit) => hit._source as Asset)
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log(error.message)
    } else {
      console.error(error.message)
    }
  }
}

export async function getSaasAssets(
  cancelToken: CancelToken
): Promise<Asset[]> {
  try {
    const result = await queryMetadata(
      generateBaseQuery({
        chainIds: Object.keys(NETWORKS_BY_ID).map((id) => parseInt(id)),
        filters: [getFilterTerm('nft.state', [0])]
      }),
      cancelToken
    )

    return result
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log(error.message)
    } else {
      console.error(error.message)
    }
  }
}
