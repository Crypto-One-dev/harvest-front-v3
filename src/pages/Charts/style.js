import styled from 'styled-components'

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  color: ${props => props.fontColor};

  background: ${props => props.pageBackColor};
  transition: 0.25s;
  position: relative;
  margin-left: 280px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-family: Inter;

  @media screen and (min-width: 1921px) {
    flex-direction: row;
  }

  @media screen and (max-width: 992px) {
    width: 100%;
    height: 100%;
    margin: 0;
  }
`

const Inner = styled.div`
  padding: 40px 41px;
  width: 50%;
  min-height: 765px;
  display: flex;
  flex-direction: column;
  gap: 10px;

  @media screen and (min-width: 1921px) {
    width: 1450px;
    height: 800px;
    padding: 35px 0 0;
  }

  @media screen and (max-width: 1480px) {
    width: 95%;
    padding: 0px 30px 0px;
  }

  @media screen and (max-width: 992px) {
    padding: 25px 24px 32px 17px;
    display: flex;
    flex-direction: column;
    gap: 5px;
    width: 100%;
  }
`

const Title = styled.div`
  font-size: 39px;
  font-weight: 600;
  line-height: 48px;
  margin-bottom: 21px;
  margin-top: 30px;

  @media screen and (max-width: 992px) {
    font-size: 22px;
    line-height: 27px;
    margin-bottom: 12px;
  }
`

const ChartSection = styled.div`
  width: 100%;
`

export { Container, Inner, Title, ChartSection }
