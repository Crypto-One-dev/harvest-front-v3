import styled from 'styled-components'

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  color: ${props=>props.fontColor};

  background: ${props => props.pageBackColor};
  transition: 0.25s;
  position: relative;
  z-index: 2;
  // margin-left: 320px;
  

  @media screen and (min-width: 1920px) {
    display: flex;
    justify-content: center;
  }

  @media screen and (max-width: 992px) {
    width: 100%;
    // padding: 0 27px;
    height: 100%;
    margin: 0;
  }
`

const Inner = styled.div`
  padding: 70px 76px 57px 76px;
    
  @media screen and (min-width: 1920px) {
    width: 1450px;
  }

  @media screen and (max-width: 1280px) {
    width: 100%;
    padding: 0px 12px 19px 12px;
  }
`

const SubPart = styled.div`
  display: flex;
  justify-content: start;

  @media screen and (max-width: 1280px) {
    display: block;
  }
`

const FarmTitle = styled.span`
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid ${props=>props.borderColor};

  // margin-top: 30px;
  // margin-bottom: 30px;
  font-weight: 500;
  font-size: 16px;
  line-height: 21px;
  z-index: 3;
  padding: 16px 20px;

  @media screen and (max-width: 992px) {
    margin-top: 15px;
    margin-bottom: 18px;
  }
`

const TransactionDetails = styled.div`
  width: 100%;
  border-radius: 10px;
  border: 1px solid ${props=>props.borderColor};
  background: ${props=>props.backColor};
  transition: 0.25s;
  margin-top: 30px;
`

const DetailView = styled.div`
  width: 100%;
  padding: 15px 6px;
  ${props=>props.mode === 'dark' ? `
    ${props.lastElement === 'yes' ? '' 
      : 'border-bottom: 1px solid rgba(255, 255, 255, 0.5);'}
  ` : `
    ${props.lastElement === 'yes' ? ``
    : `
      border-bottom: 1px solid #E9E9E9;
    `}
  `}
  transition: 0.25s;

  @media screen and (max-width: 992px) {
    padding: 12px;
  }
`

const FlexDiv = styled.div`
  display: flex;
  position: relative;
  width: ${props => props.width ? props => props.width : "auto"};

  @media screen and (max-width: 992px) {
    ${props => props.display ? `
      display: ${props.display};
      // width: 50%;
    ` : 
    ``};
  }
`

const MyFarm = styled.div`
  font-weight: 600;
  font-size: 15px;
  line-height: 23px;
  display: flex;

  color: #101828;
  align-self: center;

  @media screen and (max-width: 992px) {
    font-size: 14px;
    line-height: 18px;
  }
`

const FarmPic = styled.img`
  position: absolute;
  right: 0;
  top: 0;
`

const EmptyPanel = styled.div`
  // height: 50%;
  padding-top: 5%;
  padding-bottom: 5%;
  
  border-radius: 5px;
  @media screen and (max-width: 992px) {
    padding-top: 70px;
  }
`

const EmptyImg = styled.img`
  margin: auto;
`

const EmptyInfo = styled.div`
  ${props => props.weight ? `
    font-weight: ${props.weight};
  ` : ''}
  ${props => props.size ? `
    font-size: ${props.size}px;
  ` : ''}
  ${props => props.height ? `
    line-height: ${props.height}px;
  ` : ''}
  ${props => props.color ? `
    color: ${props.color};
  ` : ''}
  ${props => props.marginTop ? `
    margin-top: ${props.marginTop};
  ` : ''}

  text-align: center;
`

const ExploreFarm = styled.button`
  background: #27AE60;
  border-radius: 12px;
  color: white;
  padding: 15px 130px;
  border: none;

  &:hover {
    background: #27AE60D0;
  }

  &:active {
    background: #27AE60F0;
  }

  img {
    margin-right: 20px;
  }

  @media screen and (max-width: 992px) {
    padding: 15px 84px;
  }
`

const Content = styled.div`
  width: ${props=>props.width};
  ${props => props.display ? `
    display: ${props.display};
  ` : ''}
  ${props => props.marginLeft ? `
    margin-left: ${props.marginLeft};
  ` : ''}
  font-weight: 400;
  font-size: 20px;
  line-height: 23px;
  align-self: center;

  @media screen and (max-width: 992px) {
      display: flex;
      justify-content: space-between;
      align-self: flex-start;
      margin-top: 14px;
      width: 100%;
  }
`

const BadgeIcon = styled.div`
  // position: absolute;
  left: 0;
  top: 0;
  width: 17px;
  height: 17px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${props=>props.badgeBack};
  box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.15);
  border-radius: 8px;

  @media screen and (max-width: 992px) {
    border-radius: 2px;
  }
`

const ThemeMode = styled.div`
  display: flex;

  #theme-switch {
    position: relative;
    width: fit-content;
    height: fit-content;
    touch-action: pan-x;
    user-select: none;
  
    input {
      cursor: pointer;
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      opacity: 0;
    }
  
    .switch-track {
      background: #7F56D9;
      border: 1px solid ${props=>props.borderColor};
      height: 24px;
      width: 50px;
      border-radius: 30px;
      transition: all 0.2s ease 0s;
    }
    .switch-thumb {
      background: white;
      background-size: cover;
      height: 20px;
      left: 2px;
      position: absolute;
      top: 2px;
      width: 20px;
      // border-image: initial;
      border-radius: 50%;
      transition: all 0.25s ease 0s;
    }
  
    &:hover .switch-thumb {
      box-shadow: 0 0 2px 3px #7F56D9;
    }
  }

  ${props=>props.mode === "token" ? `
      #theme-switch {
        .switch-check {
          opacity: 1;
        }
        .switch-x {
          opacity: 0;
        }
        .switch-thumb {
          left: 27px;
        }
      }
    ` : `
      
    `}
`

const Div = styled.div`
  width: 32%;
`

const Counter = styled.div`
  ${props => props.count > 0 ? `
  color: white;
  ` : `
  color: #1F2937;
  `
  }
  background: #F2C94C;
  width: 20px;
  height: 20px;
  border-radius: 13px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 10px;

  @media screen and (max-width: 992px) {
    // background: #FF7E00;
    color: white;
  }
`

const Header = styled.div`
  width: 100%;
  padding: 10px 6px;
  background: #F9FAFB;
  border-bottom: 1px solid ${props=>props.borderColor};
  display: flex;
`

const Column = styled.div`
  width: ${props=>props.width};
  font-weight: 500;
  font-size: 12px;
  line-height: 15px;
  ${props=>props.color ? `
    color: ${props.color};
  ` : `
    color: #475467;
  `}
  
`

const Status = styled.div`
  ${props=>props.status === 'Active' ?  `
      background: #ECFDF3;
      color: #027A48;
    ` : `
      background: #FFE8C8;
      color: #F2994A;
      img {
        filter: invert(60%) sepia(97%) saturate(5817%) hue-rotate(15deg) brightness(87%) contrast(86%);
      }
  `};

  padding: 2px 7px;
  font-size: 12px;
  line-height: 18px;
  font-weight: 500;
  display: flex;
  width: fit-content;
  border-radius: 13px;
  align-items: center;

  img {
    margin-right: 5px;
  }
`

const Btn = styled.button`
  border: 1px solid #D0D5DD;
  box-shadow: 0px 1px 1px rgba(16, 24, 40, 0.05);
  border-radius: 5px;
  color: #344054;
  padding: 6px 10px;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
`

const SelField = styled.div`
  height: 17px;
  width: 17px;
  border: 1px solid #D0D5DD;
  border-radius: 5px;
`

export { Container, SubPart, TransactionDetails, DetailView, FarmTitle, 
  FlexDiv, MyFarm, FarmPic, BadgeIcon, Inner, EmptyPanel, EmptyInfo, EmptyImg, ExploreFarm,
  Content, ThemeMode, Div, Counter, Header, Column, Status, Btn, SelField }
