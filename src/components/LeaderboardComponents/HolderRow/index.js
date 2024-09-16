import React, { useState, useEffect } from 'react'
import { useMediaQuery } from 'react-responsive'
import { Content, DetailView, FlexDiv, ContentInner } from './style'
import { useThemeContext } from '../../../providers/useThemeContext'
import ARBITRUM from '../../../assets/images/chains/arbitrum.svg'
import BASE from '../../../assets/images/chains/base.svg'
import ETHEREUM from '../../../assets/images/logos/badge/ethereum.svg'
import POLYGON from '../../../assets/images/logos/badge/polygon.svg'
import ZKSYNC from '../../../assets/images/logos/badge/zksync.svg'
import ListItem from '../ListItem'
import { truncateAddress, formatNumber } from '../../../utilities/formats'
import { useRate } from '../../../providers/Rate'
import { chainList } from '../../../constants'

const HolderRow = ({ value, cKey, accounts, groupOfVaults, lastItem }) => {
  const [badgeId, setBadgeId] = useState(-1)
  const [chainId, setChainId] = useState(-1)
  const [platform, setPlatform] = useState('')

  const BadgeAry = [ETHEREUM, POLYGON, ARBITRUM, BASE, ZKSYNC]

  const isMobile = useMediaQuery({ query: '(max-width: 992px)' })
  const { borderColor, hoverColor, fontColor1 } = useThemeContext()
  const [currencySym, setCurrencySym] = useState('$')
  const { rates } = useRate()

  useEffect(() => {
    if (rates.rateData) {
      setCurrencySym(rates.currency.icon)
    }
  }, [rates])

  useEffect(() => {
    const getBadge = () => {
      chainList.forEach((el, i) => {
        if (el.chainId === Number(chainId)) {
          setBadgeId(i)
        }
      })
    }
    getBadge()
  }, [chainId])

  useEffect(() => {
    const vaultKey = Object.keys(value.vaults)[0]
    const vaultData = Object.values(groupOfVaults).find(vault => {
      if (vault.vaultAddress && vaultKey) {
        return vault.vaultAddress.toLowerCase() === vaultKey.toLowerCase()
      }
      return false
    })
    const chain = vaultData ? vaultData.chain : ''
    const platformName = vaultData ? vaultData.platform : ''

    setChainId(chain)
    setPlatform(platformName)
  }, [groupOfVaults, value.vaults])

  const monthlyYield = (value.totalDailyYield * 365) / 12
  const walletApy = (monthlyYield / value.totalBalance) * 12 * 100
  const allocationValue = (monthlyYield / value.totalBalance) * 12

  const getTokenNames = (userVault, dataVaults) => {
    const vaults = userVault.vaults
    const tokenNames = []

    Object.entries(vaults).forEach(([vaultKey]) => {
      Object.entries(dataVaults).forEach(([, vaultData]) => {
        if (vaultData.vaultAddress) {
          if (vaultData.vaultAddress.toLowerCase() === vaultKey.toLowerCase()) {
            if (vaultData.tokenNames.length > 1) {
              tokenNames.push(vaultData.tokenNames.join(', '))
            } else {
              tokenNames.push(...vaultData.tokenNames)
            }
          }
        }
      })
    })

    return tokenNames
  }

  const matchedTokenNames = getTokenNames(value, groupOfVaults)

  return (
    <DetailView borderColor={borderColor} hoverColor={hoverColor} key={cKey} lastItem={lastItem}>
      <FlexDiv padding={isMobile ? '10px' : '0'}>
        <Content width={isMobile ? '100%' : '100%'} display={isMobile ? 'block' : 'flex'}>
          <ContentInner width={isMobile ? '100%' : '10%'} display={isMobile ? 'block' : 'flex'}>
            <ListItem
              weight={500}
              size={isMobile ? 12 : 14}
              marginTop={isMobile ? 10 : 0}
              color={fontColor1}
              value={`#${cKey}`}
            />
          </ContentInner>
          <ContentInner width={isMobile ? '5%' : '15%'}>
            <ListItem
              weight={400}
              size={isMobile ? 12 : 14}
              marginTop={isMobile ? 10 : 0}
              color={fontColor1}
              value={truncateAddress(accounts)}
            />
          </ContentInner>
          <ContentInner width={isMobile ? '5%' : '15%'}>
            <ListItem
              weight={400}
              size={isMobile ? 12 : 14}
              marginTop={isMobile ? 10 : 0}
              color="#475467"
              value={`${currencySym}${formatNumber(value.totalBalance, 2)}`}
            />
          </ContentInner>
          <ContentInner width={isMobile ? '5%' : '15%'}>
            <ListItem
              value={matchedTokenNames.length}
              weight={400}
              size={isMobile ? 12 : 14}
              marginTop={isMobile ? 10 : 0}
              color="#475467"
            />
          </ContentInner>
          <ContentInner width={isMobile ? '5%' : '15%'}>
            {Object.entries(value.vaults)
              .slice(0, 1)
              .map(([vaultKey, vaultValue]) => {
                return (
                  <React.Fragment key={vaultKey}>
                    <ListItem
                      value={formatNumber(vaultValue.balance, 2)}
                      weight={400}
                      size={isMobile ? 12 : 14}
                      marginTop={isMobile ? 10 : 0}
                      color="#5FCF76"
                    />
                    <ListItem
                      value={matchedTokenNames[0]}
                      weight={400}
                      size={isMobile ? 12 : 10}
                      marginTop={isMobile ? 10 : 0}
                      color="#6988FF"
                      platform={platform}
                      chain={BadgeAry[badgeId]}
                    />
                  </React.Fragment>
                )
              })}
          </ContentInner>
          <ContentInner width={isMobile ? '5%' : '15%'}>
            <ListItem
              weight={400}
              size={isMobile ? 12 : 14}
              marginTop={isMobile ? 10 : 0}
              color="#5FCF76"
              value={`${formatNumber(walletApy, 2)}%`}
              allocationValue={allocationValue}
            />
            <ListItem
              weight={400}
              size={isMobile ? 12 : 10}
              marginTop={isMobile ? 10 : 0}
              color="#6988FF"
              value={`${currencySym}${formatNumber(allocationValue, 2)}/yr per $1 allocated`}
              allocationValue={allocationValue}
            />
          </ContentInner>
          <ContentInner width={isMobile ? '5%' : '15%'}>
            <ListItem
              weight={400}
              size={isMobile ? 12 : 12}
              marginTop={isMobile ? 10 : 0}
              color="#5FCF76"
              backColor="rgba(95, 207, 118, 0.2)"
              borderRadius="16px"
              padding="2px 8px"
              justifyContent="center"
              value={`${currencySym}${formatNumber(monthlyYield, 2)}/mo`}
            />
          </ContentInner>
        </Content>
      </FlexDiv>
    </DetailView>
  )
}

export default HolderRow
