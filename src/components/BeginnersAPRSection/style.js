import styled from 'styled-components'
import ETH from '../../assets/images/logos/beginnershome/eth.svg'
import DAI from '../../assets/images/logos/beginnershome/dai.svg'
import USDT from '../../assets/images/logos/beginnershome/usdt.svg'
import USDC from '../../assets/images/logos/beginnershome/usdc.svg'

const Container = styled.a`
  transition: 0.25s;
  width: 100%;
  min-height: 320px;
  padding: 20px;
  display: flex;
  justify-content: center;
  cursor: pointer;
  text-decoration: none;
  border-radius: 13px;
  box-shadow: 0px 4px 4px -2px rgba(16, 24, 40, 0.03), 0px 10px 12px -2px rgba(16, 24, 40, 0.08);
  &:hover {
    box-shadow: 0px 4px 4px -2px rgba(16, 24, 40, 0.23), 0px 10px 12px -2px rgba(16, 24, 40, 0.28);
  }
  position: relative;
  overflow: hidden;
  ${props =>
    props.num === 0
      ? `
    background: url(${DAI});
  `
      : props.num === 1
      ? `
    background: url(${ETH});
  `
      : props.num === 2
      ? `
    background: url(${USDT});
  `
      : `
    background: url(${USDC});
  `}
  background-size: cover;
  background-repeat: no-repeat;

  img.bottom {
    position: absolute;
    width: 100%;
    bottom: 0;
  }

  @media screen and (max-width: 992px) {
    min-height: 200px;
  }
`

const Percent = styled.div`
  border-radius: 18px;
  background: white;
  font-weight: 500;
  font-size: 16px;
  line-height: 22px;
  color: #344054;
  transition: 0.25s;
  margin-top: 15px;
  padding: 2px 11px 2px 8px;
  display: flex;
  justify-content: center;
  img {
    margin-right: 5px;
  }

  @media screen and (max-width: 992px) {
    margin-top: 8px;
    font-size: 8px;
    line-height: 12px;
    font-weight: 500;
  }
`

const Section = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;

  @media screen and (max-width: 992px) {
    img.token-icon {
      width: 73px;
      height: 73px;
    }
  }
`

export { Container, Percent, Section }
