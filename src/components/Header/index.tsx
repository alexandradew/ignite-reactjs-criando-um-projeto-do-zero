import styles from './header.module.scss';
import Link from 'next/link'

function LogoIcon() {
  return <img src="/logo.svg" alt="logo" />
}

export default function Header() {
  return (
    <Link href='/'>
      <div className={styles.header}>
        <LogoIcon />
      </div>    
    </Link>
   )
}
