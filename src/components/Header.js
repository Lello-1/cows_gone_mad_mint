import "../app/styles/Header.css";
import Image from "next/image";
import ButtonExt from "./ButtonExt";
import logo from '../../public/assets/cgm_logo.png';
import twitter from "../../public/social/twitter.svg";
import insta from "../../public/social/insta.svg";
import discord from "../../public/social/discord.svg";
import opensea from "../../public/social/opensea.svg";

const Header = ({ openseaURL }) => {
  return (
    <div className="header-wrapper">
      <div className="inner-nav">
        <div className="header-items">
          <a className="header--logo" href="https://cowsgonemad.com/">
            <Image
              className="logo-image"
              src={logo}
              alt="Cows Gone Mad Logo"
              priority={true}
            />
          </a>
          <div className="header--nav">
            <div className="header--nav-items">
              <ButtonExt
                location="https://twitter.com/CowsGoneMad"
                image={twitter}
                alt={"Twitter"}
              />
            </div>
            <div className="header--nav-items">
              <ButtonExt
                location="https://discord.gg/BgygezJAYz"
                image={discord}
                alt={"Discord"}
              />
            </div>
            <div className="header--nav-items">
              <ButtonExt
                location="https://www.instagram.com/cowsgonemad/"
                image={insta}
                alt={"Instagram"}
              />
            </div>
            <div className="header--nav-items">
              <ButtonExt
                location={openseaURL}
                image={opensea}
                alt={"Opensea"}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="nav-accent"></div>
    </div>
  );
};

export default Header;
