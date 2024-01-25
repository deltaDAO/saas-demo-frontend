import { ChangeEvent, useState } from 'react'
import Dotdotdot from 'react-dotdotdot'
import External from '../../../../public/external.svg'
import styles from './index.module.css'
import classNames from 'classnames/bind'
import Loader from '../../shared/Loader'
import { Asset } from '@oceanprotocol/lib'
import { SelectedAsset } from '../../../pages'

const cx = classNames.bind(styles)

export function Empty({ message }: { message: string }) {
  return <div className={styles.empty}>{message}</div>
}

export default function AssetSelection({
  assets,
  setSelectedAsset,
  disabled,
  ...props
}: {
  assets: Asset[]
  setSelectedAsset: (selectedAsset: SelectedAsset) => void
  disabled?: boolean
}): JSX.Element {
  const [searchValue, setSearchValue] = useState('')

  function handleSearchInput(e: ChangeEvent<HTMLInputElement>) {
    setSearchValue(e.target.value)
  }

  return (
    <div className={cx({ selection: true })}>
      <input
        name="search"
        placeholder="Search by name or DID..."
        value={searchValue}
        onChange={handleSearchInput}
        className={`${styles.input} ${styles.search}`}
      />
      <div className={styles.scroll}>
        {!assets ? (
          <Loader />
        ) : assets && !assets.length ? (
          <Empty message="No service found." />
        ) : (
          assets
            .filter((asset) =>
              searchValue !== ''
                ? asset.metadata.name
                    .toLowerCase()
                    .includes(searchValue.toLowerCase()) ||
                  asset.id.toLowerCase().includes(searchValue.toLowerCase())
                : asset
            )
            .map((asset) => (
              <div className={styles.row} key={asset.id}>
                <input
                  id={asset.id}
                  name="saasServiceList"
                  className={`${styles.input} ${styles.radio}`}
                  {...props}
                  type="radio"
                  onChange={() =>
                    setSelectedAsset({
                      did: asset.id,
                      name: asset.metadata.name
                    })
                  }
                />
                <label
                  className={styles.label}
                  htmlFor={asset.id}
                  title={asset.metadata.name}
                >
                  <h3 className={styles.assetTitle}>
                    <Dotdotdot clamp={1} tagName="span">
                      {asset.metadata.name}
                    </Dotdotdot>
                    <a
                      className={styles.link}
                      href={`${process.env.NEXT_PUBLIC_PORTAL_URI}/asset/${asset.id}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <External />
                    </a>
                  </h3>
                  <Dotdotdot clamp={1} tagName="code" className={styles.did}>
                    {asset.id}
                  </Dotdotdot>
                </label>
              </div>
            ))
        )}
      </div>
    </div>
  )
}
