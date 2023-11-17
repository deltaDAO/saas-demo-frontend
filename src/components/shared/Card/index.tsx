import { ReactElement } from 'react'
import styles from './index.module.css'
import Checkmark from '../../../../public/checkmark.svg'

export default function Card({
  completed,
  children,
}: {
  completed?: boolean
  children: ReactElement
}): ReactElement {
  return (
    <div className={styles.card}>
      {completed && <Checkmark className={styles.completed} />}
      {children}
    </div>
  )
}
