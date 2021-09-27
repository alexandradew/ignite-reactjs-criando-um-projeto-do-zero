import styles from './header.module.scss';

function LogoIcon() {
  return <img src="/logo.svg" alt="logo" />
}

export default function Header() {
  return (
    <div className={styles.header}>
      <LogoIcon />
    </div>
   )
}
