import styles from "./header.module.css";
import Image from "next/image";
import ButtonExt from "./ButtonExt";
import logo from '../../public/assets/cgm_logo.png';
import twitter from "../../public/social/twitter.svg";
import insta from "../../public/social/insta.svg";
import discord from "../../public/social/discord.svg";
import opensea from "../../public/social/opensea.svg";

const Header = ({ socials }) => {
  return (
    <div className={styles.header_wrapper}>
      <div className={styles.inner_nav}>
        <div className={styles.header_items}>
          <a className="" href={socials.websiteURL}>
            <Image
              className={styles.logo_image}
              src={logo}
              alt="Cows Gone Mad Logo"
              priority={true}
            />
          </a>
          <div className={styles.header_nav}>
            <div className={styles.header_nav_items}>
              <ButtonExt
                location={socials.twitterURL}
                image={twitter}
                alt={"Twitter"}
              />
            </div>
            <div className={styles.header_nav_items}>
              <ButtonExt
                location={socials.discordURL}
                image={discord}
                alt={"Discord"}
              />
            </div>
            <div className={styles.header_nav_items}>
              <ButtonExt
                location={socials.instagramURL}
                image={insta}
                alt={"Instagram"}
              />
            </div>
            <div className={styles.header_nav_items}>
              <ButtonExt
                location={socials.openseaURL}
                image={opensea}
                alt={"Opensea"}
              />
            </div>
          </div>
        </div>
      </div>
      <div className={styles.nav_accent}></div>
    </div>
  );
};

export default Header;
