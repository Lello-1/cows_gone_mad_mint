import styles from "./button.module.css";
import Image from "next/image";

const ButtonExt = ({ location, image, alt }) => {
  return (
    <a className={styles.button} href={location} target="_blank" rel="noreferrer">
      <Image className={styles.button_img} src={image} alt={alt} />
    </a>
  );
};

export default ButtonExt;