import { ReactElement, FormEvent } from 'react'
import classNames from 'classnames/bind'
import styles from './index.module.css'
import Button from '../Button'

const cx = classNames.bind(styles)

export interface AlertProps {
  title?: string
  badge?: string
  text: string
  state: 'error' | 'warning' | 'info' | 'success'
  action?: {
    name: string
    style?: 'text' | 'primary' | 'ghost'
    disabled?: boolean
    handleAction?: (e: FormEvent<HTMLButtonElement>) => void
    href?: string
  }
  onDismiss?: () => void
  className?: string
}

export default function Alert({
  title,
  text,
  state,
  action,
  onDismiss,
  className,
}: AlertProps): ReactElement {
  const styleClasses = cx({
    alert: true,
    [state]: state,
    [className]: className,
  })

  return (
    <div className={styleClasses}>
      {title && <h3 className={styles.title}>{title}</h3>}
      {text}
      {action && (
        <Button
          className={styles.action}
          size="small"
          style={action.style || 'primary'}
          onClick={action.handleAction}
          href={action.href}
          disabled={action.disabled}
        >
          {action.name}
        </Button>
      )}
      {onDismiss && (
        <button className={styles.close} onClick={onDismiss}>
          &times;
        </button>
      )}
    </div>
  )
}
