import styles from "./mint_input.module.css";

export default function Mint_Input({ mintAmount, setMintAmount }) {

  const nextNum = () => {
    setMintAmount(mintAmount + 1);
  }
  const prevNum = () => {
    mintAmount !== 1 ? setMintAmount(mintAmount - 1) : setMintAmount(1);
  }

  return (
    <div>
      <div className={styles.input_container}>
        <div className={styles.inc_box} onMouseDown={e => nextNum()}>
          <span className={styles.increment} />
        </div>
        <div className={styles.dec_box} onMouseDown={e => prevNum()}>
          <span className={styles.decrement} />
        </div>
        <div>
          <span className={styles.unit} >{mintAmount}</span>
        </div>
      </div>
    </div>
  )
}