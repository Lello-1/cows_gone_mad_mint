import styled from "styled-components";

// Used for wrapping a page component
export const Screen = styled.div`
  background-color: #000;
  background-size: repeat;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

// Used for providing space between components
export const SpacerXSmall = styled.div`
  height: 8px;
  width: 8px;
`;

// Used for providing space between components
export const SpacerSmall = styled.div`
  height: 16px;
  width: 16px;
`;

// Used for providing space between components
export const SpacerMedium = styled.div`
  height: 24px;
  width: 24px;
`;

// Used for providing space between components
export const SpacerLarge = styled.div`
  height: 32px;
  width: 32px;
`;

// Used for providing a wrapper around a component
export const Container = styled.div`
  display: flex;
  flex: ${({ flex }) => (flex ? flex : 0)};
  flex-direction: ${({ fd }) => (fd ? fd : "column")};
  justify-content: ${({ jc }) => (jc ? jc : "flex-start")};
  align-items: ${({ ai }) => (ai ? ai : "flex-start")};
  background-color: ${({ test }) => (test ? "pink" : "none")};
  width: 100%;
  background-image: ${({ image }) => (image ? `url(${image})` : "none")};
  background-size: cover;
  background-position: top;
  background-repeat: no-repeat;
`;

export const TextTitle = styled.h2`
  font-family: "screebie";
  color: #fff;
  transform: scale(1, 0.65);
  -webkit-text-stroke-width: 1px;
  -webkit-text-stroke-color: black;
  font-size: 7em;
  font-weight: 700;
  line-height: 1.4;
`;

export const TextSubTitle = styled.h3`
  color: #fff;
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.6;
`;

export const TextDescription = styled.p`
  font-family: ;
  color: #fff;
  font-size: 1.6rem;
  line-height: 1.6;
`;

export const StyledClickable = styled.div`
  :active {
    opacity: 0.6;
  }
`;

export const StyledButton = styled.button`
  font-family: screebie;
  font-size: 2.5em;
  font-weight: 700;
  padding: 15px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  border-radius: 10px;
  border: none;
  background-color: #00f5d0;
  color: #fff;
  width: 190px;
  cursor: pointer;
  transition: 0.3s;
  transform: scale(1, 0.65);
  -webkit-text-stroke-width: 1px;
  -webkit-text-stroke-color: black;
  :hover {
    opacity: 0.7;
  }
`;

export const StyledRoundButton = styled.button`
  padding: 10px;
  border-radius: 100%;
  border: none;
  background-color: #f7f8fa;
  padding: 10px;
  font-weight: bold;
  font-size: 15px;
  color: white;
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 15px 225px 255px 15px 15px 255px 225px 15px;
  border-style: solid;
  border-width: 2px;
  color: #010606;
  border-color: #010606;
  border-bottom-left-radius: 15px 255px;
  border-bottom-right-radius: 225px 15px;
  border-top-left-radius: 255px 15px;
  border-top-right-radius: 15px 225px;
  box-shadow: rgba(245, 220, 255, 1) 4px 4px 1px 1px;
  -webkit-box-shadow: rgba(245, 220, 255, 1) 4px 4px 1px 1px;
  -moz-box-shadow: rgba(245, 220, 255, 1) 4px 4px 1px 1px;
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const ResponsiveWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: stretched;
  align-items: stretched;
  width: 100%;
  /* @media (max-width: 766px) {
    flex-direction: column; */
    /* flex-direction: column-reverse; */
  }
`;

export const StyledLogo = styled.img`
  width: 195px;
  @media (min-width: 767px) {
    width: 195px;
  }
  max-height: 100px;
  transition: width 0.5s;
  transition: height 0.5s;
  cursor: pointer;
`;

export const StyledImg = styled.img`
  box-shadow: 0px 5px 11px 2px rgba(0, 0, 0, 0.7);
  background-color: #66bcd7;
  height: auto;
  margin: 0 auto;
  max-width: 30rem;
  border-radius: 50%;
  box-shadow: 0 0 1rem 0.2rem white;
  /* transition: width 0.5s; */
`;

export const StyledCont = styled.div`
  /* width: 60%; */
  /* border: 2px solid black; */
  padding: 0 10rem 2rem 10rem;
  display: flex;
  justify-content: center;
  grid-gap: 3rem;
  flex-direction: row;
  align-items: center;
  @media (max-width: 766px) {
    flex-direction: column;
    align-items: center;
  }
`;

export const StyledLink = styled.a`
  color: white;
  text-decoration: none;
`;