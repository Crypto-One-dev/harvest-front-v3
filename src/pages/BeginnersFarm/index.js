import BigNumber from 'bignumber.js'
import { find, get, isEqual, isEmpty, isArray, isNaN } from 'lodash'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useMediaQuery } from 'react-responsive'
import ReactTooltip from 'react-tooltip'
import { useHistory, useLocation } from 'react-router-dom'
import useEffectWithPrevious from 'use-effect-with-previous'
import { ethers } from 'ethers'
import { BiRightArrowAlt } from 'react-icons/bi'
import { RxCross2 } from 'react-icons/rx'
import { PiQuestion } from 'react-icons/pi'
import tokenMethods from '../../services/web3/contracts/token/methods'
import tokenContract from '../../services/web3/contracts/token/contract.json'
import logoNew from '../../assets/images/logos/sidebar/ifarm.svg'
import ARBITRUM from '../../assets/images/chains/arbitrum.svg'
import BASE from '../../assets/images/chains/base.svg'
import ETHEREUM from '../../assets/images/chains/ethereum.svg'
import POLYGON from '../../assets/images/chains/polygon.svg'
import ZKSYNC from '../../assets/images/chains/zksync.svg'
import Safe from '../../assets/images/logos/beginners/safe.svg'
import BarChart from '../../assets/images/logos/beginners/bar-chart-01.svg'
import History from '../../assets/images/logos/beginners/history.svg'
import FarmerAvatar from '../../assets/images/logos/sidebar/connectavatar.png'
import AnimatedDots from '../../components/AnimatedDots'
import DepositBase from '../../components/AdvancedFarmComponents/Deposit/DepositBase'
import DepositSelectToken from '../../components/AdvancedFarmComponents/Deposit/DepositSelectToken'
import DepositStart from '../../components/AdvancedFarmComponents/Deposit/DepositStart'
import WithdrawBase from '../../components/AdvancedFarmComponents/Withdraw/WithdrawBase'
import WithdrawSelectToken from '../../components/AdvancedFarmComponents/Withdraw/WithdrawSelectToken'
import WithdrawStart from '../../components/AdvancedFarmComponents/Withdraw/WithdrawStart'
import FarmDetailChart from '../../components/DetailChart/FarmDetailChart'
import UserBalanceData from '../../components/UserBalanceChart/UserBalanceData'
import EarningsHistory from '../../components/EarningsHistory/HistoryData'
import {
  DECIMAL_PRECISION,
  FARM_TOKEN_SYMBOL,
  IFARM_TOKEN_SYMBOL,
  SPECIAL_VAULTS,
  BEGINNERS_BALANCES_DECIMALS,
  POOL_BALANCES_DECIMALS,
  MAX_BALANCES_DECIMALS,
  WIDO_BALANCES_DECIMALS,
  SOCIAL_LINKS,
  feeList,
  chainList,
} from '../../constants'
import { fromWei, newContractInstance, getWeb3, getExplorerLink } from '../../services/web3'
import { addresses } from '../../data'
import { usePools } from '../../providers/Pools'
import { useStats } from '../../providers/Stats'
import { useThemeContext } from '../../providers/useThemeContext'
import { useVaults } from '../../providers/Vault'
import { useWallet } from '../../providers/Wallet'
import { useRate } from '../../providers/Rate'
import {
  displayAPY,
  formatFrequency,
  formatNumber,
  formatNumberWido,
  showTokenBalance,
  showUsdValue,
  showUsdValueCurrency,
} from '../../utilities/formats'
import { getTotalApy, getVaultValue } from '../../utilities/parsers'
import { getAdvancedRewardText } from '../../utilities/html'
import { getLastHarvestInfo, initBalanceAndDetailData } from '../../utilities/apiCalls'
import {
  BigDiv,
  DetailView,
  FlexDiv,
  FlexTopDiv,
  HalfContent,
  Inner,
  TopInner,
  TopButton,
  LogoImg,
  NewLabel,
  RestContent,
  TopDesc,
  TopPart,
  MyBalance,
  GuideSection,
  GuidePart,
  DepositSection,
  WithdrawSection,
  MainSection,
  ChainBack,
  MainTag,
  InternalSection,
  WelcomeBox,
  WelcomeTop,
  FarmerImage,
  WelcomeContent,
  WelcomeTitle,
  WelcomeText,
  WelcomeClose,
  HeaderBadge,
  HalfInfo,
  InfoLabel,
  DescInfo,
  LastHarvestInfo,
  RestInternal,
  MainTagPanel,
  FirstPartSection,
  TabRow,
  NetDetail,
  NetDetailItem,
  BoxCover,
  ManageBoxWrapper,
  EarningsBadge,
  ValueBox,
  BoxTitle,
  BoxValue,
  NetDetailTitle,
  NetDetailContent,
  NetDetailImg,
  MobileChain,
  LinksContainer,
  Logo,
  ThemeMode,
  SwitchMode,
} from './style'
import { CHAIN_IDS } from '../../data/constants'
// import { array } from 'prop-types'
import { usePortals } from '../../providers/Portals'

const mainTags = [
  { name: 'Start Farming', img: Safe },
  { name: 'Farm Details', img: BarChart },
  { name: 'History', img: History },
]

const BeginnersFarm = () => {
  const {
    darkMode,
    bgColor,
    hoverColor,
    fontColor,
    fontColor1,
    fontColor2,
    fontColor3,
    fontColor4,
    fontColor6,
    borderColor,
    bgColorTooltip,
    backColor,
  } = useThemeContext()

  const paramAddress = '0x0B0193fAD49DE45F5E2B0A9f5D6Bc3BB7D281688'

  const {
    getPortalsBaseTokens,
    getPortalsBalances,
    getPortalsSupport,
    SUPPORTED_TOKEN_LIST,
  } = usePortals()

  const isMobile = useMediaQuery({ query: '(max-width: 992px)' })

  const { push } = useHistory()

  const { pathname } = useLocation()

  const { allVaultsData, loadingVaults } = useVaults()
  const { allPools, userStats, fetchUserPoolStats } = usePools()
  const { connected, account, balances, getWalletBalances } = useWallet()
  const { profitShareAPY } = useStats()
  /* eslint-disable global-require */
  const { tokens } = require('../../data')

  // Switch Tag (Deposit/Withdraw)
  const [activeDepo, setActiveDepo] = useState(true)
  const [showLatestEarnings, setShowLatestEarnings] = useState(true)
  const [showApyHistory, setShowApyHistory] = useState(true)
  const [welcomeMessage, setWelcomeMessage] = useState(true)
  const [showBadge, setShowBadge] = useState(false)
  const [supportedVault, setSupportedVault] = useState(true)
  const [hasPortalsError, setHasPortalsError] = useState(true)
  const [badgeId, setBadgeId] = useState(-1)
  const [chartData, setChartData] = useState([])

  // Deposit
  const [depositStart, setDepositStart] = useState(false)
  const [selectTokenDepo, setSelectTokenDepo] = useState(false)
  const [balanceDepo, setBalanceDepo] = useState('0')
  const [pickedTokenDepo, setPickedTokenDepo] = useState({ symbol: 'Select Token' })
  const [inputAmountDepo, setInputAmountDepo] = useState('0')
  const [fromInfoAmount, setFromInfoAmount] = useState('')
  const [fromInfoUsdAmount, setFromInfoUsdAmount] = useState('')
  const [minReceiveAmountString, setMinReceiveAmountString] = useState('')
  const [minReceiveUsdAmount, setMinReceiveUsdAmount] = useState('')
  const [convertSuccess, setConvertSuccess] = useState(false)
  const [hasErrorOccurredConvert, setHasErrorOccurredConvert] = useState(0)
  const [failureCountConvert, setFailureCountConvert] = useState(0)

  // Withdraw
  const [withdrawStart, setWithdrawStart] = useState(false)
  const [selectTokenWith, setSelectTokenWith] = useState(false)
  const [unstakeBalance, setUnstakeBalance] = useState('0')
  const [pickedTokenWith, setPickedTokenWith] = useState({ symbol: 'Select' })
  const [unstakeInputValue, setUnstakeInputValue] = useState('0')
  const [revertFromInfoAmount, setRevertFromInfoAmount] = useState('')
  const [revertFromInfoUsdAmount, setRevertFromInfoUsdAmount] = useState('')
  const [revertMinReceivedAmount, setRevertMinReceivedAmount] = useState('')
  const [revertMinReceivedUsdAmount, setRevertMinReceivedUsdAmount] = useState('')
  const [revertSuccess, setRevertSuccess] = useState(false)
  const [hasErrorOccurredRevert, setHasErrorOccurredRevert] = useState(0)

  const [yieldDaily, setYieldDaily] = useState(0)
  const [yieldMonthly, setYieldMonthly] = useState(0)
  const [convertMonthlyYieldUSD, setConvertMonthlyYieldUSD] = useState('0')
  const [convertDailyYieldUSD, setConvertDailyYieldUSD] = useState('0')

  const [balanceList, setBalanceList] = useState([])
  const [supTokenList, setSupTokenList] = useState([])
  const [supTokenNoBalanceList, setSupTokenNoBalanceList] = useState([])
  const [defaultToken, setDefaultToken] = useState(null)
  const [soonToSupList, setSoonToSupList] = useState([])

  const [vaultValue, setVaultValue] = useState(null)
  const [lastHarvest, setLastHarvest] = useState('')

  const [totalValue, setTotalValue] = useState(0)
  const [underlyingValue, setUnderlyingValue] = useState(0)
  const [depositedValueUSD, setDepositUsdValue] = useState(0)
  const [balanceAmount, setBalanceAmount] = useState(0)
  const firstUnderlyingBalance = useRef(true)
  const [underlyingEarnings, setUnderlyingEarnings] = useState(0)
  const [underlyingEarningsLatest, setUnderlyingEarningsLatest] = useState(0)
  const [usdEarnings, setUsdEarnings] = useState(0)
  const [usdEarningsLatest, setUsdEarningsLatest] = useState(0)

  // Chart & Table API data
  const [historyData, setHistoryData] = useState([])
  const [sevenDApy, setSevenDApy] = useState('')
  const [thirtyDApy, setThirtyDApy] = useState('')
  const [oneEightyDApy, setOneEightyDApy] = useState('')
  const [threeSixtyDApy, setThreeSixtyDApy] = useState('')
  const [lifetimeApy, setLifetimeApy] = useState('')
  const [vaultBirthday, setVaultBirthday] = useState('')
  const [vaultTotalPeriod, setVaultTotalPeriod] = useState('')
  const [latestSharePrice, setLatestSharePrice] = useState('')

  const [sevenDHarvest, setSevenDHarvest] = useState('')
  const [thirtyDHarvest, setThirtyDHarvest] = useState('')
  const [oneEightyDHarvest, setOneEightyDHarvest] = useState('')
  const [threeSixtyDHarvest, setThreeSixtyDHarvest] = useState('')
  const [harvestFrequency, setHarvestFrequency] = useState('')

  const { rates } = useRate()
  const [currencySym, setCurrencySym] = useState('$')
  const [currencyName, setCurrencyName] = useState('USD')
  const [currencyRate, setCurrencyRate] = useState(1)

  useEffect(() => {
    if (rates.rateData) {
      setCurrencySym(rates.currency.icon)
      setCurrencyName(rates.currency.symbol)
      setCurrencyRate(rates.rateData[rates.currency.symbol])
    }
  }, [rates])

  const farmProfitSharingPool = allPools.find(
    pool => pool.id === SPECIAL_VAULTS.NEW_PROFIT_SHARING_POOL_ID,
  )
  const poolVaults = useMemo(
    () => ({
      [FARM_TOKEN_SYMBOL]: {
        poolVault: true,
        profitShareAPY,
        data: farmProfitSharingPool,
        logoUrl: ['./icons/ifarm.svg'],
        tokenAddress: addresses.FARM,
        vaultAddress: addresses.FARM,
        rewardSymbol: 'iFarm',
        tokenNames: ['FARM'],
        decimals: 18,
      },
    }),
    [farmProfitSharingPool, profitShareAPY],
  )

  const groupOfVaults = { ...allVaultsData, ...poolVaults }
  const vaultsKey = Object.keys(groupOfVaults)
  const vaultIds = vaultsKey.filter(vaultId => {
    const tokenAddress = groupOfVaults[vaultId].tokenAddress || groupOfVaults[vaultId].vaultAddress

    if (typeof tokenAddress === 'string') {
      return (
        groupOfVaults[vaultId].vaultAddress.toLowerCase() === paramAddress.toLowerCase() ||
        tokenAddress.toLowerCase() === paramAddress.toLowerCase()
      )
    }

    if (typeof tokenAddress === 'object' && tokenAddress !== null) {
      const tokenAddresses = Object.values(tokenAddress)
      return (
        groupOfVaults[vaultId].vaultAddress.toLowerCase() === paramAddress.toLowerCase() ||
        tokenAddresses.some(address => address.toLowerCase() === paramAddress.toLowerCase())
      )
    }

    return false
  })
  const id = vaultIds[0]
  const token = groupOfVaults[id]

  const { logoUrl } = token

  const isSpecialVault = token.poolVault
  const tokenVault = get(allVaultsData, token.hodlVaultId || id)

  const vaultPool = isSpecialVault
    ? token.data
    : find(allPools, pool => pool.collateralAddress === get(tokenVault, `vaultAddress`))

  const farmAPY = get(vaultPool, 'totalRewardAPY', 0)
  const tradingApy = get(vaultPool, 'tradingApy', 0)
  const boostedEstimatedAPY = get(tokenVault, 'boostedEstimatedAPY', 0)
  const boostedRewardAPY = get(vaultPool, 'boostedRewardAPY', 0)
  const totalApy = isSpecialVault
    ? getTotalApy(null, token, true)
    : getTotalApy(vaultPool, tokenVault)

  const chain = token.chain || token.data.chain

  const BadgeAry = [ETHEREUM, POLYGON, ARBITRUM, BASE, ZKSYNC]

  useEffect(() => {
    const getBadge = () => {
      chainList.forEach((el, i) => {
        if (el.chainId === Number(chain)) {
          setBadgeId(i)
        }
      })
    }
    getBadge()
  }, [chain])

  useEffect(() => {
    // 👇️ scroll to top on page load
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }, [])

  const useBeginnersFarm = true
  const useIFARM = id === FARM_TOKEN_SYMBOL
  const fAssetPool = isSpecialVault
    ? token.data
    : find(allPools, pool => pool.collateralAddress === tokens[id].vaultAddress)
  const multipleAssets = useMemo(
    () =>
      isArray(tokens[id].tokenAddress) &&
      tokens[id].tokenAddress.map(address => {
        const selectedSymbol = Object.keys(tokens).find(
          symbol =>
            !isArray(tokens[symbol].tokenAddress) &&
            tokens[symbol].tokenAddress.toLowerCase() === address.toLowerCase(),
        )
        return selectedSymbol
      }),
    [id, tokens],
  )

  const tokenDecimals = token.decimals || tokens[id].decimals
  const lpTokenBalance = get(userStats, `[${fAssetPool.id}]['lpTokenBalance']`, 0)
  const totalStaked = get(userStats, `[${fAssetPool.id}]['totalStaked']`, 0)

  const tempPricePerFullShare = useIFARM
    ? get(allVaultsData, `${IFARM_TOKEN_SYMBOL}.pricePerFullShare`, 0)
    : get(token, `pricePerFullShare`, 0)
  const pricePerFullShare = fromWei(tempPricePerFullShare, tokenDecimals, tokenDecimals)

  const usdPrice =
    Number(token.vaultPrice) ||
    Number(token.data && token.data.lpTokenData && token.data.lpTokenData.price) *
      Number(pricePerFullShare)
  const farmPrice = token.data && token.data.lpTokenData && token.data.lpTokenData.price
  const underlyingPrice = get(token, 'usdPrice', get(token, 'data.lpTokenData.price', 0))

  const switchEarnings = () => setShowLatestEarnings(prev => !prev)
  const switchHistory = () => setShowApyHistory(prev => !prev)

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search)
    if (queryParams.has('utm_source') || queryParams.has('utm_medium')) {
      setShowBadge(true) // Don't show the Badge if the parameters are present
    }
  }, [])

  useEffect(() => {
    async function fetchData() {
      const tokenAddress = useIFARM ? addresses.iFARM : token.vaultAddress || token.tokenAddress
      const chainId = token.chain || token.data.chain

      const portalsToken = await getPortalsSupport(chainId, tokenAddress)

      if (portalsToken === undefined || portalsToken.status !== 200) {
        setHasPortalsError(true)
      } else if (portalsToken.status === 200) {
        setHasPortalsError(false)
        if (portalsToken.data.totalItems === 0) {
          setSupportedVault(false)
        } else {
          setSupportedVault(true)
        }
      }
    }

    fetchData()
    // eslint-disable-next-line
  }, [token])

  useEffect(() => {
    const staked =
      totalStaked &&
      fromWei(totalStaked, fAssetPool.lpTokenData.decimals, MAX_BALANCES_DECIMALS, true)

    const unstaked =
      lpTokenBalance &&
      fromWei(lpTokenBalance, fAssetPool.lpTokenData.decimals, MAX_BALANCES_DECIMALS, true)
    const total = Number(staked) + Number(unstaked)
    const amountBalanceUSD = total * usdPrice * Number(currencyRate)
    setTotalValue(total)
    setBalanceAmount(amountBalanceUSD)

    const estimatedApyByPercent = get(tokenVault, `estimatedApy`, 0)
    const estimatedApy = estimatedApyByPercent / 100
    const vaultAPR = ((1 + estimatedApy) ** (1 / 365) - 1) * 365
    const vaultAPRDaily = vaultAPR / 365
    const vaultAPRMonthly = vaultAPR / 12

    let totalRewardAPRByPercent = 0
    for (let j = 0; j < fAssetPool.rewardAPR?.length; j += 1) {
      totalRewardAPRByPercent += Number(fAssetPool.rewardAPR[j])
    }
    const totalRewardAPR = totalRewardAPRByPercent / 100
    const poolAPRDaily = totalRewardAPR / 365
    const poolAPRMonthly = totalRewardAPR / 12

    const swapFeeAPRYearly = (fAssetPool.tradingApy ? fAssetPool.tradingApy : 0) / 100
    const swapFeeAPRDaily = swapFeeAPRYearly / 365
    const swapFeeAPRMonthly = swapFeeAPRYearly / 12

    const dailyYield =
      (Number(staked) * usdPrice * (vaultAPRDaily + poolAPRDaily + swapFeeAPRDaily) +
        Number(unstaked) * usdPrice * (vaultAPRDaily + swapFeeAPRDaily)) *
      Number(currencyRate)
    const monthlyYield =
      (Number(staked) * usdPrice * (vaultAPRMonthly + poolAPRMonthly + swapFeeAPRMonthly) +
        Number(unstaked) * usdPrice * (vaultAPRMonthly + swapFeeAPRMonthly)) *
      Number(currencyRate)
    setYieldDaily(dailyYield)
    setYieldMonthly(monthlyYield)
  }, [fAssetPool, tokenVault, usdPrice, lpTokenBalance, totalStaked, currencyRate])

  useEffect(() => {
    const convertMonthlyYieldValue =
      (Number(minReceiveAmountString) *
        Number(usdPrice) *
        Number(currencyRate) *
        (Number(totalApy) / 100)) /
      12
    const convertDailyYieldYieldValue =
      (Number(minReceiveAmountString) *
        Number(usdPrice) *
        Number(currencyRate) *
        (Number(totalApy) / 100)) /
      365
    setConvertMonthlyYieldUSD(convertMonthlyYieldValue.toString())
    setConvertDailyYieldUSD(convertDailyYieldYieldValue.toString())
  }, [minReceiveAmountString, usdPrice, totalApy, currencyRate])

  useEffect(() => {
    const getTokenBalance = async () => {
      try {
        if (chain && account && Object.keys(balances).length !== 0) {
          if (!hasPortalsError) {
            let supList = [],
              directInSup = {},
              directInBalance = {}

            const portalsRawBalances = await getPortalsBalances(account, chain.toString())
            const portalsBaseTokens = await getPortalsBaseTokens(chain.toString())
            const curNoBalances = portalsBaseTokens
              .map(baseToken => {
                const balToken = portalsRawBalances.find(
                  el => el.address.toLowerCase() === baseToken.address.toLowerCase(),
                )
                if (balToken === undefined) {
                  const item = {
                    symbol: baseToken.symbol,
                    address: baseToken.address,
                    balance: 0,
                    default: false,
                    usdValue: 0,
                    usdPrice: baseToken.price,
                    logoURI: baseToken.image
                      ? baseToken.image
                      : baseToken.images
                      ? baseToken.images[0]
                      : 'https://etherscan.io/images/main/empty-token.png',
                    decimals: baseToken.decimals,
                    chainId: chain,
                  }
                  return item
                }

                return null
              })
              .filter(item => item !== null)

            const curBalances = portalsRawBalances
              .map(balance => {
                if (!ethers.utils.isAddress(balance.address))
                  balance.address = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
                const item = {
                  symbol: balance.symbol,
                  address: balance.address,
                  balance: new BigNumber(balance.rawBalance).div(10 ** balance.decimals).toFixed(),
                  rawBalance: balance.rawBalance,
                  default: false,
                  usdValue: balance.balanceUSD,
                  usdPrice: balance.price,
                  logoURI: balance.image
                    ? balance.image
                    : balance.images
                    ? balance.images[0]
                    : 'https://etherscan.io/images/main/empty-token.png',
                  decimals: balance.decimals,
                  chainId: chain,
                }
                return item
              })
              .filter(item => item.address)

            const tokenAddress =
              token.tokenAddress !== undefined && token.tokenAddress.length !== 2
                ? token.tokenAddress
                : token.vaultAddress

            const fTokenAddr = useIFARM
              ? addresses.iFARM
              : token.vaultAddress
              ? token.vaultAddress
              : token.tokenAddress

            const curSortedBalances = curBalances
              .sort(function reducer(a, b) {
                return b.usdValue - a.usdValue
              })
              .filter(item => item.address.toLowerCase() !== fTokenAddr.toLowerCase())

            setBalanceList(curSortedBalances)

            supList = [...curBalances, ...curNoBalances]

            supList = supList.map(sup => {
              const supToken = curBalances.find(el => el.address === sup.address)
              if (supToken) {
                sup.balance = supToken.balance
                sup.usdValue = supToken.usdValue
                sup.usdPrice = supToken.usdPrice
              } else {
                sup.balance = '0'
                sup.usdValue = '0'
              }
              sup.default = false

              if (Object.keys(directInSup).length === 0 && tokenAddress.length !== 2) {
                if (sup.address.toLowerCase() === tokenAddress.toLowerCase()) {
                  directInSup = sup
                }
              }
              return sup
            })

            supList = supList.sort(function reducer(a, b) {
              return b.usdValue - a.usdValue
            })

            const cl = curBalances.length
            for (let j = 0; j < cl; j += 1) {
              if (Object.keys(directInBalance).length === 0 && tokenAddress.length !== 2) {
                if (curBalances[j].address.toLowerCase() === tokenAddress.toLowerCase()) {
                  directInBalance = curBalances[j]
                }
              }
            }

            const directData = curBalances.find(
              el => el.address.toLowerCase() === tokenAddress.toLowerCase(),
            )
            const directBalance = directData
              ? directData.balance
              : balances[id]
              ? new BigNumber(balances[id]).div(10 ** token.decimals).toFixed()
              : '0'
            const directUsdPrice = token.usdPrice
            const directUsdValue = directData
              ? directData.usdValue
              : new BigNumber(directBalance).times(directUsdPrice).toFixed()

            if (!(Object.keys(directInSup).length === 0 && directInSup.constructor === Object)) {
              directInSup.balance = directBalance
              directInSup.usdPrice =
                directInSup.usdPrice > 0 ? directInSup.usdPrice : directUsdPrice
              directInSup.usdValue =
                directInSup.usdValue > 0 ? directInSup.usdValue : directUsdValue
              supList = supList.sort(function result(x, y) {
                return x === directInSup ? -1 : y === directInSup ? 1 : 0
              })
              supList[0].default = true
            } else if (
              !(Object.keys(directInBalance).length === 0 && directInBalance.constructor === Object)
            ) {
              directInBalance.balance = directBalance || '0'
              directInBalance.usdPrice =
                directInBalance.usdPrice > 0 ? directInBalance.usdPrice : directUsdPrice
              directInBalance.usdValue =
                directInBalance.usdValue > 0 ? directInBalance.usdValue : directUsdValue
              supList.unshift(directInBalance)
              supList[0].default = true
            } else {
              const web3Client = await getWeb3(chain, null)
              const { getSymbol } = tokenMethods
              const lpInstance = await newContractInstance(
                id,
                tokenAddress,
                tokenContract.abi,
                web3Client,
              )
              const lpSymbol = await getSymbol(lpInstance)
              const direct = {
                symbol: lpSymbol,
                address: tokenAddress,
                balance: directBalance || '0',
                default: true,
                usdPrice: directUsdPrice || '0',
                usdValue: directUsdValue || '0',
                logoURI: 'https://etherscan.io/images/main/empty-token.png',
                decimals: tokenDecimals,
                chainId: parseInt(chain, 0),
              }
              supList.unshift(direct)
            }
            if (supList[0].default) {
              if (supList[0].balance === '0' && balances[supList[0].symbol]) {
                const defaultBalance = fromWei(
                  balances[supList[0].symbol],
                  supList[0].decimals,
                  supList[0].decimals,
                )
                const defaultUsdBalance = formatNumber(
                  Number(supList[0].usdPrice) * Number(defaultBalance),
                  2,
                )
                supList[0].balance = defaultBalance
                supList[0].usdValue = defaultUsdBalance
              }
              setDefaultToken(supList[0])
            } else {
              setDefaultToken({})
            }
            // supList.shift()
            setSupTokenList(supList)

            const supNoBalanceList = [],
              sl = supList.length
            if (sl > 0) {
              for (let i = 0; i < sl; i += 1) {
                if (Number(supList[i].balance) === 0) {
                  supNoBalanceList.push(supList[i])
                }
              }
            }
            supNoBalanceList.shift()
            setSupTokenNoBalanceList(supNoBalanceList)

            // const soonSupList = []
            // for (let j = 0; j < curBalances.length; j += 1) {
            //   const supToken = supList.find(el => el.address === curBalances[j].address)
            //   if (!supToken) {
            //     soonSupList.push(curBalances[j])
            //   }

            //   if (Object.keys(directInBalance).length === 0 && tokenAddress.length !== 2) {
            //     if (curBalances[j].address.toLowerCase() === tokenAddress.toLowerCase()) {
            //       directInBalance = curBalances[j]
            //     }
            //   }
            // }
            // setSoonToSupList(soonSupList)
            setSoonToSupList({}) // TODO: remove soonToSupList once confirmed
          } else {
            let tokenSymbol,
              decimals = 18

            decimals = useIFARM ? token.data?.watchAsset?.decimals : token.decimals
            tokenSymbol = useIFARM ? token.tokenNames[0] : token?.pool?.lpTokenData?.symbol
            if (tokenSymbol && tokenSymbol.substring(0, 1) === 'f') {
              tokenSymbol = tokenSymbol.substring(1)
            }
            // const tokenAddress = useIFARM ? addresses.iFARM : token.tokenAddress
            const tokenAddress = token.tokenAddress
            const tokenId = token?.pool?.id
            const tokenBalance = fromWei(
              balances[useIFARM ? tokenSymbol : tokenId],
              decimals,
              decimals,
            )
            const tokenPrice = useIFARM ? token?.data?.lpTokenData?.price : token.usdPrice
            const usdValue = formatNumberWido(
              Number(tokenBalance) * Number(tokenPrice),
              BEGINNERS_BALANCES_DECIMALS,
            )
            const logoURI =
              token.logoUrl.length === 1
                ? token.logoUrl[0].substring(1)
                : 'https://etherscan.io/images/main/empty-token.png'

            const defaultTokenData = {
              symbol: tokenSymbol,
              address: tokenAddress,
              balance: tokenBalance,
              default: true,
              usdValue,
              usdPrice: tokenPrice,
              logoURI,
              decimals,
              chainId: useIFARM ? token.data.chain : token.chain,
            }
            setDefaultToken(defaultTokenData)
          }
        }
      } catch (err) {
        console.log('getTokenBalance: ', err)
      }
    }
    console.debug('convert status', convertSuccess)
    console.debug('revert status', revertSuccess)
    getTokenBalance()
  }, [account, chain, balances, hasPortalsError, convertSuccess, revertSuccess, useIFARM]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (supTokenList.length > 0) {
      for (let i = 0; i < supTokenList.length; i += 1) {
        if (supTokenList[i].symbol === 'ETH') {
          setPickedTokenWith(supTokenList[i])
          return
        }
      }
    }
  }, [supTokenList])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (defaultToken !== null) {
        let tokenToSet = null

        // Check if defaultToken is present in the balanceList
        if (defaultToken.balance !== '0' || !supportedVault || hasPortalsError) {
          setPickedTokenDepo(defaultToken)
          setBalanceDepo(defaultToken.balance)
          return
        }

        // If defaultToken is not found, find the token with the highest USD value among those in the SUPPORTED_TOKEN_LIST and balanceList
        const supportedTokens = balanceList.filter(
          balancedToken => SUPPORTED_TOKEN_LIST[chain][balancedToken.symbol],
        )
        if (supportedTokens.length > 0) {
          tokenToSet = supportedTokens.reduce((prevToken, currentToken) =>
            prevToken.usdValue > currentToken.usdValue ? prevToken : currentToken,
          )
        }

        // If no token is found in SUPPORTED_TOKEN_LIST, set the token with the highest USD value in balanceList
        if (!tokenToSet) {
          if (balanceList.length > 0) {
            tokenToSet = balanceList.reduce((prevToken, currentToken) =>
              prevToken.usdValue > currentToken.usdValue ? prevToken : currentToken,
            )
          } else {
            tokenToSet = defaultToken
          }
        }

        // Set the pickedTokenDepo and balanceDepo based on the determined tokenToSet
        if (tokenToSet) {
          setPickedTokenDepo(tokenToSet)
          setBalanceDepo(
            fromWei(
              tokenToSet.rawBalance ? tokenToSet.rawBalance : 0,
              tokenToSet.decimals,
              tokenToSet.decimals,
            ),
          )
        }
      } else if (supTokenList.length !== 0) {
        setPickedTokenDepo(supTokenList.find(coin => coin.symbol === 'USDC'))
        setBalanceDepo('0')
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [
    balanceList,
    supTokenList,
    defaultToken,
    chain,
    SUPPORTED_TOKEN_LIST,
    supportedVault,
    hasPortalsError,
  ])

  const firstUserPoolsLoad = useRef(true)
  const firstWalletBalanceLoad = useRef(true)

  useEffectWithPrevious(
    ([prevAccount, prevUserStats, prevBalances]) => {
      const hasSwitchedAccount = account !== prevAccount && account

      if (
        hasSwitchedAccount ||
        firstUserPoolsLoad.current ||
        (userStats && !isEqual(userStats, prevUserStats))
      ) {
        const loadUserPoolsStats = async () => {
          firstUserPoolsLoad.current = false
          const poolsToLoad = [fAssetPool]
          await fetchUserPoolStats(poolsToLoad, account, userStats)
        }
        loadUserPoolsStats()
      }

      if (
        hasSwitchedAccount ||
        firstWalletBalanceLoad.current ||
        (balances && !isEqual(balances, prevBalances))
      ) {
        const getBalance = async () => {
          firstWalletBalanceLoad.current = false
          await getWalletBalances([IFARM_TOKEN_SYMBOL, FARM_TOKEN_SYMBOL, id], false, true)
        }

        getBalance()
      }
    },
    [account, userStats, balances],
  )

  // Switch Deposit / Withdraw
  const switchDepoMethod = () => setActiveDepo(prev => !prev)

  // Deposit / Stake / Details
  const [activeMainTag, setActiveMainTag] = useState(0)

  const curUrl = document.location.href
  useEffect(() => {
    if (curUrl.includes('#farm%20details')) {
      setActiveMainTag(1)
    } else if (curUrl.includes('#history')) {
      setActiveMainTag(2)
    }
  }, [curUrl])

  useEffect(() => {
    const getLastHarvest = async () => {
      const value = await getLastHarvestInfo(paramAddress, chain)
      setLastHarvest(value)
    }

    getLastHarvest()
  }, [paramAddress, chain])

  useEffect(() => {
    setVaultValue(getVaultValue(token))
  }, [token])

  useEffect(() => {
    const depositUsdValue = formatNumber(
      fromWei(lpTokenBalance, fAssetPool?.lpTokenData?.decimals, POOL_BALANCES_DECIMALS, true) *
        usdPrice,
      POOL_BALANCES_DECIMALS,
    )
    setDepositUsdValue(depositUsdValue)
  }, [lpTokenBalance, fAssetPool, usdPrice])

  useEffect(() => {
    const hasZeroValue = underlyingValue === 0
    if (account && hasZeroValue && (firstUnderlyingBalance.current || !isEmpty(allVaultsData))) {
      const getUnderlyingBalance = async () => {
        firstUnderlyingBalance.current = false
        const val = Number(
          fromWei(
            get(allVaultsData, `${IFARM_TOKEN_SYMBOL}.underlyingBalanceWithInvestmentForHolder`, 0),
            tokens[IFARM_TOKEN_SYMBOL].decimals,
            WIDO_BALANCES_DECIMALS,
          ),
        )
        setUnderlyingValue(val)
      }

      getUnderlyingBalance()
    }
  }, [account, allVaultsData, underlyingValue, tokens])

  useEffect(() => {
    const initData = async () => {
      if (account && token && vaultPool && id) {
        const address =
          token.vaultAddress || vaultPool.autoStakePoolAddress || vaultPool.contractAddress
        const chainId = token.chain || token.data.chain
        const {
          balanceFlag,
          vaultHFlag,
          sumNetChange,
          sumNetChangeUsd,
          sumLatestNetChange,
          sumLatestNetChangeUsd,
          enrichedData,
          uniqueVaultHData,
        } = await initBalanceAndDetailData(address, chainId, account, tokenDecimals)

        if (balanceFlag && vaultHFlag) {
          setUnderlyingEarnings(sumNetChange)
          setUsdEarnings(sumNetChangeUsd)
          setUnderlyingEarningsLatest(sumLatestNetChange)
          setUsdEarningsLatest(sumLatestNetChangeUsd)
          const enrichedDataWithSymbol = enrichedData.map(data => ({
            ...data,
            tokenSymbol: id,
          }))
          setHistoryData(enrichedDataWithSymbol)
          setChartData(uniqueVaultHData)
        }
      }
    }

    initData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account])

  const apyDaily = totalApy
    ? (((Number(totalApy) / 100 + 1) ** (1 / 365) - 1) * 100).toFixed(3)
    : null

  const showAPY = () => {
    return (
      <>
        {isSpecialVault ? (
          token.data &&
          token.data.loaded &&
          (token.data.dataFetched === false || totalApy !== null) ? (
            <div>{token.inactive ? 'Inactive' : <>{totalApy ? displayAPY(totalApy) : null}</>}</div>
          ) : (
            <div>
              <AnimatedDots />
            </div>
          )
        ) : vaultPool.loaded && totalApy !== null && !loadingVaults ? (
          <div>
            {token.inactive || token.testInactive || token.hideTotalApy || !token.dataFetched ? (
              token.inactive || token.testInactive ? (
                'Inactive'
              ) : null
            ) : (
              <>{displayAPY(totalApy, DECIMAL_PRECISION, 10)}</>
            )}
          </div>
        ) : (
          <div>
            <AnimatedDots />
          </div>
        )}
      </>
    )
  }

  const showTVL = () => {
    return (
      <>
        {token.excludeVaultStats ? (
          'N/A'
        ) : vaultValue ? (
          <>{`${currencySym}${formatNumber(Number(vaultValue) * Number(currencyRate), 2)}`}</>
        ) : (
          <AnimatedDots />
        )}
      </>
    )
  }

  const showApyDaily = () => {
    return (
      <>
        {isSpecialVault ? (
          token.data &&
          token.data.loaded &&
          (token.data.dataFetched === false || totalApy !== null) ? (
            <div>{token.inactive ? 'Inactive' : <>{totalApy ? `${apyDaily}%` : null}</>}</div>
          ) : (
            <AnimatedDots />
          )
        ) : vaultPool.loaded && totalApy !== null && !loadingVaults ? (
          <div>
            {token.inactive || token.testInactive || token.hideTotalApy || !token.dataFetched ? (
              token.inactive || token.testInactive ? (
                'Inactive'
              ) : null
            ) : (
              <>{apyDaily}%</>
            )}
          </div>
        ) : (
          <AnimatedDots />
        )}
      </>
    )
  }

  const detailBoxes = [
    { title: 'Live APY', showValue: showAPY, className: 'balance-box' },
    { title: 'Daily APY', showValue: showApyDaily, className: 'daily-apy-box' },
    { title: 'TVL', showValue: showTVL },
    {
      title: 'Last Harvest',
      showValue: () => (useIFARM ? '-' : lastHarvest !== '' ? `${lastHarvest} ago` : '-'),
      className: 'daily-yield-box',
    },
  ]

  const apyPeriods = [
    { label: 'Live', value: showAPY() },
    { label: '7d', value: sevenDApy },
    { label: '30d', value: thirtyDApy },
    { label: '180d', value: oneEightyDApy },
    { label: '365d', value: threeSixtyDApy },
    { label: 'Lifetime', value: lifetimeApy },
  ]

  const harvestFrequencies = [
    {
      label: 'Latest',
      value: useIFARM ? '-' : lastHarvest !== '' ? `${lastHarvest} ago` : '-',
    },
    { label: '7d', value: formatFrequency(sevenDHarvest) },
    { label: '30d', value: formatFrequency(thirtyDHarvest) },
    { label: '180d', value: formatFrequency(oneEightyDHarvest) },
    { label: '365d', value: formatFrequency(threeSixtyDHarvest) },
    { label: 'Lifetime', value: formatFrequency(harvestFrequency) },
  ]

  const rewardTxt = getAdvancedRewardText(
    token,
    vaultPool,
    tradingApy,
    farmAPY,
    totalApy,
    true,
    boostedEstimatedAPY,
    boostedRewardAPY,
  )

  const profitShare =
    chain === CHAIN_IDS.ETH_MAINNET ? '10' : chain === CHAIN_IDS.POLYGON_MAINNET ? '5' : '7'
  const harvestTreasury =
    chain === CHAIN_IDS.ETH_MAINNET ? '5' : chain === CHAIN_IDS.POLYGON_MAINNET ? '3' : '3'

  return (
    <DetailView bgColor={bgColor} fontColor={fontColor}>
      <TopInner>
        <TopPart>
          <FlexTopDiv>
            <TopButton className="back-btn">
              {isMobile && (
                <LinksContainer showBadge={showBadge ? 'flex' : 'none'}>
                  <Logo
                    className="logo"
                    onClick={() => {
                      push('/')
                    }}
                  >
                    <img src={logoNew} width={52} height={52} alt="Harvest" />
                  </Logo>
                  <MobileChain>
                    {!showBadge && (
                      <NetDetailItem>
                        <NetDetailContent>{token.platform && token.platform[0]}</NetDetailContent>
                      </NetDetailItem>
                    )}
                    <ChainBack>
                      <img src={BadgeAry[badgeId]} alt="" />
                    </ChainBack>
                  </MobileChain>
                </LinksContainer>
              )}
            </TopButton>
            <FlexDiv className="farm-symbol">
              {logoUrl.map((el, i) => (
                <LogoImg className="logo" src={el.slice(1, el.length)} key={i} alt="" />
              ))}
              <TopDesc
                weight={600}
                size={isMobile ? '19.7px' : '25px'}
                height={isMobile ? '45px' : '82px'}
                marginBottom={isMobile ? '5px' : '10px'}
              >
                {token.tokenNames.join(' • ')}
              </TopDesc>
            </FlexDiv>
            <GuideSection>
              <GuidePart>
                <span role="img" aria-label="thumb" aria-labelledby="thumb">
                  👍
                </span>{' '}
                For Beginners
              </GuidePart>
              <GuidePart>
                {displayAPY(totalApy, DECIMAL_PRECISION, 10)}
                &nbsp;APY
              </GuidePart>
              <GuidePart>Revert anytime</GuidePart>
            </GuideSection>
            <TabRow>
              <MainTagPanel>
                {mainTags.map((tag, i) => (
                  <MainTag
                    fontColor4={fontColor4}
                    bgColor={bgColor}
                    key={i}
                    active={activeMainTag === i ? 'true' : 'false'}
                    mode={darkMode ? 'dark' : 'light'}
                    onClick={() => {
                      setActiveMainTag(i)
                      if (i !== 0) {
                        push(`${pathname}#${tag.name.toLowerCase()}`)
                      } else {
                        push(pathname)
                      }
                    }}
                  >
                    <img src={tag.img} alt="logo" />
                    <p>{tag.name}</p>
                  </MainTag>
                ))}
              </MainTagPanel>
              <NetDetail>
                <NetDetailItem>
                  <NetDetailTitle>Platform:</NetDetailTitle>
                  <NetDetailContent>{token.platform && token.platform[0]}</NetDetailContent>
                </NetDetailItem>
                <NetDetailItem>
                  <NetDetailTitle>Network</NetDetailTitle>
                  <NetDetailImg>
                    <img src={BadgeAry[badgeId]} alt="" />
                  </NetDetailImg>
                </NetDetailItem>
              </NetDetail>
            </TabRow>
          </FlexTopDiv>
        </TopPart>
      </TopInner>
      <Inner>
        <BigDiv>
          <InternalSection>
            {activeMainTag === 0 ? (
              <>
                {welcomeMessage &&
                  (isMobile ? (
                    <WelcomeBox bgColorTooltip={bgColorTooltip} borderColor={borderColor}>
                      <WelcomeTop>
                        <FarmerImage src={FarmerAvatar} alt="avatar" />
                        <WelcomeTitle>
                          Welcome, Farmer{' '}
                          <span role="img" aria-label="hand" aria-labelledby="hand">
                            👋
                          </span>
                        </WelcomeTitle>
                        <WelcomeClose>
                          <RxCross2 onClick={() => setWelcomeMessage(false)} />
                        </WelcomeClose>
                      </WelcomeTop>
                      <WelcomeContent fontColor={fontColor}>
                        {showBadge ? (
                          <WelcomeText>
                            Earn $10 in FARM by converting at least $5 worth of USDC into the
                            interest-bearing fToken of this farm. Quest participants also need to
                            hold that fToken for at least 72 hours to be eligible for the reward.
                            <br />
                            <br />
                            If you need any help, see our{' '}
                            <a
                              href={SOCIAL_LINKS.TutorialQuest}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              tutorial
                            </a>{' '}
                            or visit{' '}
                            <a
                              href={SOCIAL_LINKS.DISCORD}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Discord channel
                            </a>
                            .
                            <br />
                            <a
                              className="badge-body"
                              href={SOCIAL_LINKS.TutorialQuest}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <HeaderBadge>
                                <div className="badge-text">
                                  Only for participants of our Base Quest campaign
                                </div>
                                <div className="badge-btn">
                                  Read more
                                  <BiRightArrowAlt />
                                </div>
                              </HeaderBadge>
                            </a>
                          </WelcomeText>
                        ) : (
                          <WelcomeText>
                            Begin yield farming in under two minutes by simply converting any token
                            in your wallet into interest-bearing fmoonwell_WETH. Start by connecting
                            your wallet, selecting the token you wish to convert, and then clicking
                            on &apos;Preview & Convert&apos; to finalize the action. Ensure that you
                            are connected to the Base Network to proceed with farming. If you need
                            any help, head over to our{' '}
                            <a
                              href={SOCIAL_LINKS.DISCORD}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Discord channel
                            </a>
                            .
                          </WelcomeText>
                        )}
                      </WelcomeContent>
                    </WelcomeBox>
                  ) : (
                    <WelcomeBox bgColorTooltip={bgColorTooltip} borderColor={borderColor}>
                      <FarmerImage src={FarmerAvatar} alt="avatar" />
                      <WelcomeContent>
                        <WelcomeTitle fontColor1={fontColor1}>
                          Welcome, Farmer{' '}
                          <span role="img" aria-label="hand" aria-labelledby="hand">
                            👋
                          </span>
                        </WelcomeTitle>
                        {showBadge ? (
                          <WelcomeText showBadge={showBadge} fontColor={fontColor}>
                            Earn $10 in FARM by converting at least $5 worth of USDC into the
                            interest-bearing fToken of this farm. Quest participants also need to
                            hold that fToken for at least 72 hours to be eligible for the reward.
                            <br />
                            <br />
                            If you need any help, see our{' '}
                            <a
                              href={SOCIAL_LINKS.TutorialQuest}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              tutorial
                            </a>{' '}
                            or visit{' '}
                            <a
                              href={SOCIAL_LINKS.DISCORD}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Discord channel
                            </a>
                            .
                            <br />
                            <a
                              className="badge-body"
                              href={SOCIAL_LINKS.TutorialQuest}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <HeaderBadge>
                                <div className="badge-text">
                                  Only for participants of our Base Quest campaign
                                </div>
                                <div className="badge-btn">
                                  Read more
                                  <BiRightArrowAlt />
                                </div>
                              </HeaderBadge>
                            </a>
                          </WelcomeText>
                        ) : (
                          <WelcomeText showBadge={showBadge} fontColor={fontColor}>
                            Begin yield farming in under two minutes by simply converting any token
                            in your wallet into interest-bearing fmoonwell_WETH. Start by connecting
                            your wallet, selecting the token you wish to convert, and then clicking
                            on &apos;Preview & Convert&apos; to finalize the action. Ensure that you
                            are connected to the Base Network to proceed with farming. If you need
                            any help, head over to our{' '}
                            <a
                              href={SOCIAL_LINKS.DISCORD}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Discord channel
                            </a>
                            .
                          </WelcomeText>
                        )}
                      </WelcomeContent>
                      <WelcomeClose>
                        <RxCross2 onClick={() => setWelcomeMessage(false)} />
                      </WelcomeClose>
                    </WelcomeBox>
                  ))}
                <ManageBoxWrapper>
                  <MyBalance
                    backColor={backColor}
                    borderColor={borderColor}
                    marginBottom={isMobile ? '20px' : '25px'}
                    marginTop={isMobile ? '0px' : '0'}
                    height={isMobile ? 'unset' : '120px'}
                  >
                    <NewLabel
                      display="flex"
                      justifyContent="space-between"
                      size={isMobile ? '12px' : '12px'}
                      weight="600"
                      height={isMobile ? '20px' : '20px'}
                      color={fontColor4}
                      padding={isMobile ? '10px 15px' : '10px 15px'}
                      borderBottom="1px solid #F2F5FF"
                    >
                      <FlexDiv>
                        {showLatestEarnings ? 'Latest Yield' : 'Lifetime Yield'}
                        <EarningsBadge>Beta</EarningsBadge>
                        <PiQuestion
                          className="question"
                          data-tip
                          data-for={
                            showLatestEarnings
                              ? 'tooltip-latest-earning'
                              : 'tooltip-lifetime-earning'
                          }
                        />
                        <ReactTooltip
                          id={
                            showLatestEarnings
                              ? 'tooltip-latest-earning'
                              : 'tooltip-lifetime-earning'
                          }
                          backgroundColor={darkMode ? 'white' : '#101828'}
                          borderColor={darkMode ? 'white' : 'black'}
                          textColor={darkMode ? 'black' : 'white'}
                        >
                          <NewLabel
                            size={isMobile ? '12px' : '12px'}
                            height={isMobile ? '18px' : '18px'}
                            weight="500"
                          >
                            {showLatestEarnings ? (
                              <>
                                Your latest yield in this farm since the last interaction (revert or
                                convert).
                                <br />
                                <br />
                                USD value is subject to market fluctuations. Claimable rewards are
                                not part of this estimation.
                                <br />
                                <br />
                                Underlying is subject to auto-compounding events.
                              </>
                            ) : (
                              <>
                                Your lifetime yield in this farm expressed in USD and Underlying
                                token. USD value is subject to market fluctuations. Claimable
                                rewards are not part of this estimation.
                                <br />
                                <br />
                                Underlying is subject to auto-compounding events.
                              </>
                            )}
                          </NewLabel>
                        </ReactTooltip>
                      </FlexDiv>
                      <ThemeMode mode={showLatestEarnings ? 'latest' : 'lifetime'}>
                        <div id="theme-switch">
                          <div className="switch-track">
                            <div className="switch-thumb" />
                          </div>

                          <input
                            type="checkbox"
                            checked={showLatestEarnings}
                            onChange={switchEarnings}
                            aria-label="Switch between lifetime and latest yields"
                          />
                        </div>
                      </ThemeMode>
                    </NewLabel>
                    <FlexDiv
                      justifyContent="space-between"
                      padding={isMobile ? '5px 15px' : '5px 15px'}
                    >
                      <NewLabel
                        display="flex"
                        size={isMobile ? '12px' : '12px'}
                        weight="500"
                        height={isMobile ? '24px' : '24px'}
                        color={fontColor3}
                      >
                        in {`${currencyName}`}
                      </NewLabel>
                      <NewLabel
                        size={isMobile ? '12px' : '12px'}
                        height={isMobile ? '24px' : '24px'}
                        weight="600"
                        color={fontColor1}
                      >
                        {showUsdValueCurrency(
                          showLatestEarnings ? usdEarningsLatest : usdEarnings,
                          currencySym,
                          currencyRate,
                        )}
                      </NewLabel>
                    </FlexDiv>
                    <FlexDiv
                      justifyContent="space-between"
                      padding={isMobile ? '5px 15px' : '5px 15px'}
                    >
                      <NewLabel
                        size={isMobile ? '12px' : '12px'}
                        height={isMobile ? '24px' : '24px'}
                        weight="500"
                        color={fontColor3}
                        self="center"
                      >
                        Underlying
                      </NewLabel>
                      <NewLabel
                        weight="600"
                        size={isMobile ? '12px' : '12px'}
                        height={isMobile ? '24px' : '24px'}
                        color={fontColor1}
                        self="center"
                        fontColor2={fontColor2}
                        position="relative"
                        align="right"
                        marginBottom={isMobile ? '12px' : '0px'}
                      >
                        <div data-tip data-for="earnings-underlying">
                          {showLatestEarnings
                            ? showTokenBalance(underlyingEarningsLatest)
                            : showTokenBalance(underlyingEarnings)}
                        </div>
                        <ReactTooltip
                          id="earnings-underlying"
                          backgroundColor={darkMode ? 'white' : '#101828'}
                          borderColor={darkMode ? 'white' : 'black'}
                          textColor={darkMode ? 'black' : 'white'}
                          place="top"
                          effect="solid"
                        >
                          <NewLabel
                            size={isMobile ? '10px' : '10px'}
                            height={isMobile ? '14px' : '14px'}
                            weight="500"
                          >
                            {showLatestEarnings ? underlyingEarningsLatest : underlyingEarnings}
                          </NewLabel>
                        </ReactTooltip>
                        <span className="symbol">{id}</span>
                      </NewLabel>
                    </FlexDiv>
                  </MyBalance>
                  <MyBalance
                    backColor={backColor}
                    borderColor={borderColor}
                    marginBottom={isMobile ? '20px' : '25px'}
                    marginTop={isMobile ? '0px' : '0'}
                    height={isMobile ? 'unset' : '120px'}
                  >
                    <NewLabel
                      display="flex"
                      justifyContent="space-between"
                      size={isMobile ? '12px' : '12px'}
                      weight="600"
                      height={isMobile ? '20px' : '20px'}
                      color={fontColor4}
                      padding={isMobile ? '10px 15px' : '10px 15px'}
                      borderBottom="1px solid #F2F5FF"
                    >
                      Total Balance
                      <PiQuestion className="question" data-tip data-for="tooltip-total-balance" />
                      <ReactTooltip
                        id="tooltip-total-balance"
                        backgroundColor={darkMode ? 'white' : '#101828'}
                        borderColor={darkMode ? 'white' : 'black'}
                        textColor={darkMode ? 'black' : 'white'}
                      >
                        <NewLabel
                          size={isMobile ? '12px' : '12px'}
                          height={isMobile ? '18px' : '18px'}
                          weight="500"
                        >
                          Total Balance reflects the fTokens in connected wallet, alongside their
                          USD value, which can change with the market.
                          <br />
                          <br />
                          The fToken count stays the same unless you revert or convert more crypto
                          in the farm.
                        </NewLabel>
                      </ReactTooltip>
                    </NewLabel>
                    <FlexDiv
                      justifyContent="space-between"
                      padding={isMobile ? '5px 15px' : '5px 15px'}
                    >
                      <NewLabel
                        display="flex"
                        size={isMobile ? '12px' : '12px'}
                        weight="500"
                        height={isMobile ? '24px' : '24px'}
                        color={fontColor3}
                      >
                        in {`${currencyName}`}
                      </NewLabel>
                      <NewLabel
                        size={isMobile ? '12px' : '12px'}
                        height={isMobile ? '24px' : '24px'}
                        weight="600"
                        color={fontColor1}
                      >
                        {!connected ? (
                          `${currencySym}0.00`
                        ) : lpTokenBalance ? (
                          showUsdValue(balanceAmount, currencySym)
                        ) : (
                          <AnimatedDots />
                        )}
                      </NewLabel>
                    </FlexDiv>
                    <FlexDiv
                      justifyContent="space-between"
                      padding={isMobile ? '5px 15px' : '5px 15px'}
                    >
                      <NewLabel
                        size={isMobile ? '12px' : '12px'}
                        height={isMobile ? '24px' : '24px'}
                        weight="500"
                        color={fontColor3}
                        self="center"
                      >
                        fToken
                      </NewLabel>
                      <NewLabel
                        size={isMobile ? '12px' : '12px'}
                        height={isMobile ? '24px' : '24px'}
                        weight="600"
                        color={fontColor1}
                        fontColor2={fontColor2}
                        position="relative"
                        align="right"
                        marginBottom={isMobile ? '12px' : '0px'}
                      >
                        <div className="question" data-tip data-for="fToken-total-balance">
                          {!connected ? (
                            0
                          ) : lpTokenBalance ? (
                            showTokenBalance(totalValue)
                          ) : (
                            <AnimatedDots />
                          )}
                        </div>
                        <ReactTooltip
                          id="fToken-total-balance"
                          backgroundColor={darkMode ? 'white' : '#101828'}
                          borderColor={darkMode ? 'white' : 'black'}
                          textColor={darkMode ? 'black' : 'white'}
                          place="top"
                          effect="solid"
                        >
                          <NewLabel
                            size={isMobile ? '10px' : '10px'}
                            height={isMobile ? '14px' : '14px'}
                            weight="500"
                          >
                            {totalValue}
                          </NewLabel>
                        </ReactTooltip>
                        <span className="symbol">{useIFARM ? `i${id}` : `f${id}`}</span>
                      </NewLabel>
                    </FlexDiv>
                  </MyBalance>
                  <MyBalance
                    backColor={backColor}
                    borderColor={borderColor}
                    marginBottom={isMobile ? '20px' : '25px'}
                    marginTop={isMobile ? '0px' : '0'}
                    height={isMobile ? 'unset' : '120px'}
                  >
                    <NewLabel
                      display="flex"
                      justifyContent="space-between"
                      size={isMobile ? '12px' : '12px'}
                      weight="600"
                      height={isMobile ? '20px' : '20px'}
                      color={fontColor4}
                      padding={isMobile ? '10px 15px' : '10px 15px'}
                      borderBottom="1px solid #F2F5FF"
                    >
                      Yield Estimates
                      <PiQuestion className="question" data-tip data-for="tooltip-yield-estimate" />
                      <ReactTooltip
                        id="tooltip-yield-estimate"
                        backgroundColor={darkMode ? 'white' : '#101828'}
                        borderColor={darkMode ? 'white' : 'black'}
                        textColor={darkMode ? 'black' : 'white'}
                      >
                        <NewLabel
                          size={isMobile ? '12px' : '12px'}
                          height={isMobile ? '18px' : '18px'}
                          weight="500"
                        >
                          Estimated yield on your fTokens of this farm based on live APY,
                          denominated in USD. Subject to market fluctuations.
                          <br />
                          Note: frequency of auto-compounding events vary, so take these numbers as
                          rough guides, not exact figures.
                        </NewLabel>
                      </ReactTooltip>
                    </NewLabel>
                    <FlexDiv
                      justifyContent="space-between"
                      padding={isMobile ? '5px 15px' : '5px 15px'}
                    >
                      <NewLabel
                        display="flex"
                        size={isMobile ? '12px' : '12px'}
                        weight="500"
                        height={isMobile ? '24px' : '24px'}
                        color={fontColor3}
                      >
                        Daily
                      </NewLabel>
                      <NewLabel
                        size={isMobile ? '12px' : '12px'}
                        height={isMobile ? '24px' : '24px'}
                        weight="600"
                        color={fontColor1}
                      >
                        {!connected
                          ? `${currencySym}0`
                          : isNaN(yieldDaily)
                          ? `${currencySym}0`
                          : showUsdValue(yieldDaily, currencySym)}
                      </NewLabel>
                    </FlexDiv>
                    <FlexDiv
                      justifyContent="space-between"
                      padding={isMobile ? '5px 15px' : '5px 15px'}
                    >
                      <NewLabel
                        size={isMobile ? '12px' : '12px'}
                        height={isMobile ? '24px' : '24px'}
                        weight="500"
                        color={fontColor3}
                        self="center"
                      >
                        Monthly
                      </NewLabel>
                      <NewLabel
                        weight="600"
                        size={isMobile ? '12px' : '12px'}
                        height={isMobile ? '24px' : '24px'}
                        color={fontColor1}
                        self="center"
                      >
                        {!connected
                          ? `${currencySym}0.00`
                          : isNaN(yieldMonthly)
                          ? `${currencySym}0.00`
                          : showUsdValue(yieldMonthly, currencySym)}
                      </NewLabel>
                    </FlexDiv>
                  </MyBalance>
                </ManageBoxWrapper>
              </>
            ) : activeMainTag === 1 ? (
              <BoxCover borderColor={borderColor}>
                {detailBoxes.map(({ title, showValue, className }, index) => (
                  <ValueBox
                    key={index}
                    width="24%"
                    className={className}
                    backColor={backColor}
                    borderColor={borderColor}
                  >
                    <BoxTitle fontColor3={fontColor3}>{title}</BoxTitle>
                    <BoxValue fontColor1={fontColor1}>{showValue()}</BoxValue>
                  </ValueBox>
                ))}
              </BoxCover>
            ) : (
              <EarningsHistory historyData={historyData} isDashboard="false" noData />
            )}
            <MainSection height={activeMainTag === 0 ? '100%' : 'fit-content'}>
              {activeMainTag === 0 ? (
                !isMobile && (
                  <UserBalanceData
                    token={token}
                    vaultPool={vaultPool}
                    useIFARM={useIFARM}
                    totalValue={totalValue}
                    farmPrice={farmPrice}
                    underlyingPrice={underlyingPrice}
                    lpTokenBalance={lpTokenBalance}
                    chartData={chartData}
                  />
                )
              ) : activeMainTag === 1 ? (
                <>
                  <HalfInfo
                    padding="25px 18px"
                    marginBottom={isMobile ? '20px' : '25px'}
                    backColor={backColor}
                    borderColor={borderColor}
                  >
                    <FarmDetailChart
                      token={token}
                      vaultPool={vaultPool}
                      lastTVL={Number(vaultValue)}
                      lastAPY={Number(totalApy)}
                      set7DApy={setSevenDApy}
                      set30DApy={setThirtyDApy}
                      set180DApy={setOneEightyDApy}
                      set360DApy={setThreeSixtyDApy}
                      setLifetimeApy={setLifetimeApy}
                      setVaultBirthday={setVaultBirthday}
                      setVaultTotalPeriod={setVaultTotalPeriod}
                      setLatestSharePrice={setLatestSharePrice}
                      set7DHarvest={setSevenDHarvest}
                      set30DHarvest={setThirtyDHarvest}
                      set180DHarvest={setOneEightyDHarvest}
                      set360DHarvest={setThreeSixtyDHarvest}
                      setHarvestFrequency={setHarvestFrequency}
                    />
                  </HalfInfo>
                  {!isMobile && (
                    <HalfInfo marginBottom="20px" backColor={backColor} borderColor={borderColor}>
                      <NewLabel
                        weight={700}
                        size="14px"
                        height="24px"
                        color={fontColor4}
                        padding="10px 15px"
                        borderBottom="1px solid #F3F6FF"
                      >
                        Source of Yield
                      </NewLabel>
                      <DescInfo fontColor6={fontColor6} fontColor3={fontColor3}>
                        <div>
                          <p>
                            This farm supplies{' '}
                            <a
                              href="https://basescan.org/token/0x4200000000000000000000000000000000000006"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              WETH
                            </a>{' '}
                            to Moonwell, a robust lending platform, earning{' '}
                            <a
                              href="https://basescan.org/token/0xFF8adeC2221f9f4D8dfbAFa6B9a297d17603493D"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              WELL
                            </a>{' '}
                            and{' '}
                            <a
                              href="https://basescan.org/token/0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              USDC
                            </a>{' '}
                            from lending activities. At every harvest, the earned rewards are
                            converted into more{' '}
                            <a
                              href="https://basescan.org/token/0x4200000000000000000000000000000000000006"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              WETH
                            </a>
                            .
                          </p>
                        </div>
                      </DescInfo>
                      <FlexDiv className="address" padding="0 15px 20px">
                        {token.vaultAddress && (
                          <InfoLabel
                            display="flex"
                            href={`${getExplorerLink(token.chain)}/address/${token.vaultAddress}`}
                            target="_blank"
                            onClick={e => e.stopPropagation()}
                            rel="noopener noreferrer"
                            bgColor={bgColor}
                            hoverColor={hoverColor}
                            borderColor={borderColor}
                          >
                            <NewLabel
                              size="12px"
                              weight={isMobile ? 600 : 600}
                              height="16px"
                              self="center"
                              color={fontColor1}
                            >
                              Vault Address
                            </NewLabel>
                          </InfoLabel>
                        )}
                        {vaultPool.autoStakePoolAddress && (
                          <InfoLabel
                            display="flex"
                            href={`${getExplorerLink(token.chain)}/address/${
                              vaultPool.contractAddress
                            }`}
                            target="_blank"
                            onClick={e => e.stopPropagation()}
                            rel="noopener noreferrer"
                            bgColor={bgColor}
                            hoverColor={hoverColor}
                            borderColor={borderColor}
                          >
                            <NewLabel
                              size="12px"
                              weight={isMobile ? 600 : 600}
                              height="16px"
                              self="center"
                              color={fontColor1}
                              hoverColor={hoverColor}
                            >
                              Strategy Address
                            </NewLabel>
                          </InfoLabel>
                        )}
                        <InfoLabel
                          display="flex"
                          href={`${getExplorerLink(token.chain)}/address/${
                            vaultPool.autoStakePoolAddress || vaultPool.contractAddress
                          }`}
                          onClick={e => e.stopPropagation()}
                          rel="noopener noreferrer"
                          target="_blank"
                          bgColor={bgColor}
                          hoverColor={hoverColor}
                          borderColor={borderColor}
                        >
                          <NewLabel
                            size="12px"
                            weight={isMobile ? 600 : 600}
                            height="16px"
                            self="center"
                            color={fontColor1}
                          >
                            Pool Address
                          </NewLabel>
                        </InfoLabel>
                      </FlexDiv>
                    </HalfInfo>
                  )}
                </>
              ) : (
                <></>
              )}
            </MainSection>
            <RestContent height={activeMainTag === 0 ? '100%' : 'fit-content'}>
              {activeMainTag === 0 ? (
                <FirstPartSection>
                  <HalfContent
                    backColor={backColor}
                    borderColor={borderColor}
                    marginBottom={isMobile ? '20px' : '0px'}
                    borderRadius={isMobile ? '12px' : '12px'}
                  >
                    <DepositSection isShow={activeDepo}>
                      <DepositBase
                        setSelectToken={setSelectTokenDepo}
                        deposit={depositStart}
                        setDeposit={setDepositStart}
                        balance={balanceDepo}
                        pickedToken={pickedTokenDepo}
                        defaultToken={defaultToken}
                        inputAmount={inputAmountDepo}
                        pricePerFullShare={pricePerFullShare}
                        setInputAmount={setInputAmountDepo}
                        token={token}
                        supTokenList={supTokenList}
                        switchMethod={switchDepoMethod}
                        tokenSymbol={id}
                        useIFARM={useIFARM}
                        useBeginnersFarm={useBeginnersFarm}
                        balanceList={balanceList}
                        setFromInfoAmount={setFromInfoAmount}
                        setFromInfoUsdAmount={setFromInfoUsdAmount}
                        fromInfoUsdAmount={fromInfoUsdAmount}
                        convertMonthlyYieldUSD={convertMonthlyYieldUSD}
                        convertDailyYieldUSD={convertDailyYieldUSD}
                        minReceiveAmountString={minReceiveAmountString}
                        setMinReceiveAmountString={setMinReceiveAmountString}
                        minReceiveUsdAmount={minReceiveUsdAmount}
                        setMinReceiveUsdAmount={setMinReceiveUsdAmount}
                        setConvertMonthlyYieldUSD={setConvertMonthlyYieldUSD}
                        setConvertDailyYieldUSD={setConvertDailyYieldUSD}
                        hasErrorOccurred={hasErrorOccurredConvert}
                        setHasErrorOccurred={setHasErrorOccurredConvert}
                        failureCount={failureCountConvert}
                        setFailureCount={setFailureCountConvert}
                        supportedVault={supportedVault}
                        setSupportedVault={setSupportedVault}
                      />
                      <DepositSelectToken
                        selectToken={selectTokenDepo}
                        setSelectToken={setSelectTokenDepo}
                        setPickedToken={setPickedTokenDepo}
                        setBalance={setBalanceDepo}
                        supTokenNoBalanceList={supTokenNoBalanceList}
                        balanceList={balanceList}
                        defaultToken={defaultToken}
                        soonToSupList={soonToSupList}
                        supportedVault={supportedVault}
                        hasPortalsError={hasPortalsError}
                      />
                      <DepositStart
                        pickedToken={pickedTokenDepo}
                        deposit={depositStart}
                        setDeposit={setDepositStart}
                        defaultToken={defaultToken}
                        inputAmount={inputAmountDepo}
                        setInputAmount={setInputAmountDepo}
                        token={token}
                        tokenSymbol={id}
                        useIFARM={useIFARM}
                        fAssetPool={fAssetPool}
                        multipleAssets={multipleAssets}
                        fromInfoAmount={fromInfoAmount}
                        fromInfoUsdAmount={fromInfoUsdAmount}
                        minReceiveAmountString={minReceiveAmountString}
                        minReceiveUsdAmount={minReceiveUsdAmount}
                        setSelectToken={setSelectTokenDepo}
                        setConvertSuccess={setConvertSuccess}
                      />
                    </DepositSection>
                    <WithdrawSection isShow={!activeDepo}>
                      <WithdrawBase
                        unstakeInputValue={unstakeInputValue}
                        setUnstakeInputValue={setUnstakeInputValue}
                        setSelectToken={setSelectTokenWith}
                        setWithdrawStart={setWithdrawStart}
                        defaultToken={defaultToken}
                        pricePerFullShare={pricePerFullShare}
                        pickedToken={pickedTokenWith}
                        unstakeBalance={unstakeBalance}
                        setUnstakeBalance={setUnstakeBalance}
                        balanceList={balanceList}
                        tokenSymbol={id}
                        fAssetPool={fAssetPool}
                        lpTokenBalance={lpTokenBalance}
                        token={token}
                        supTokenList={supTokenList}
                        switchMethod={switchDepoMethod}
                        useIFARM={useIFARM}
                        setRevertFromInfoAmount={setRevertFromInfoAmount}
                        revertFromInfoUsdAmount={revertFromInfoUsdAmount}
                        setRevertFromInfoUsdAmount={setRevertFromInfoUsdAmount}
                        setRevertMinReceivedAmount={setRevertMinReceivedAmount}
                        revertMinReceivedAmount={revertMinReceivedAmount}
                        revertMinReceivedUsdAmount={revertMinReceivedUsdAmount}
                        setRevertMinReceivedUsdAmount={setRevertMinReceivedUsdAmount}
                        hasErrorOccurred={hasErrorOccurredRevert}
                        setHasErrorOccurred={setHasErrorOccurredRevert}
                      />
                      <WithdrawSelectToken
                        selectToken={selectTokenWith}
                        setSelectToken={setSelectTokenWith}
                        setPickedToken={setPickedTokenWith}
                        supTokenList={supTokenList}
                        supTokenNoBalanceList={supTokenNoBalanceList}
                        balanceList={balanceList}
                        defaultToken={defaultToken}
                        soonToSupList={soonToSupList}
                        supportedVault={supportedVault}
                        hasPortalsError={hasPortalsError}
                      />
                      <WithdrawStart
                        groupOfVaults={groupOfVaults}
                        unstakeInputValue={unstakeInputValue}
                        withdrawStart={withdrawStart}
                        setWithdrawStart={setWithdrawStart}
                        defaultToken={defaultToken}
                        pickedToken={pickedTokenWith}
                        setPickedToken={setPickedTokenWith}
                        token={token}
                        unstakeBalance={unstakeBalance}
                        tokenSymbol={id}
                        fAssetPool={fAssetPool}
                        multipleAssets={multipleAssets}
                        useIFARM={useIFARM}
                        depositedValueUSD={depositedValueUSD}
                        setRevertFromInfoAmount={setRevertFromInfoAmount}
                        revertFromInfoAmount={revertFromInfoAmount}
                        revertFromInfoUsdAmount={revertFromInfoUsdAmount}
                        revertMinReceivedAmount={revertMinReceivedAmount}
                        revertMinReceivedUsdAmount={revertMinReceivedUsdAmount}
                        setUnstakeInputValue={setUnstakeInputValue}
                        setRevertSuccess={setRevertSuccess}
                      />
                    </WithdrawSection>
                  </HalfContent>
                  {isMobile ? (
                    <UserBalanceData
                      token={token}
                      vaultPool={vaultPool}
                      totalValue={totalValue}
                      useIFARM={useIFARM}
                      farmPrice={farmPrice}
                      underlyingPrice={underlyingPrice}
                      lpTokenBalance={lpTokenBalance}
                      chartData={chartData}
                    />
                  ) : (
                    <></>
                  )}
                </FirstPartSection>
              ) : activeMainTag === 1 ? (
                <RestInternal>
                  <LastHarvestInfo backColor={backColor} borderColor={borderColor}>
                    <NewLabel
                      size={isMobile ? '12px' : '14px'}
                      weight={isMobile ? '600' : '600'}
                      height={isMobile ? '20px' : '24px'}
                      color={fontColor4}
                      padding={isMobile ? '10px 15px' : '10px 15px'}
                      borderBottom="1px solid #F3F6FF"
                    >
                      Info
                    </NewLabel>
                    <FlexDiv
                      justifyContent="space-between"
                      padding={isMobile ? '10px 15px' : '10px 15px'}
                    >
                      <NewLabel
                        size={isMobile ? '12px' : '14px'}
                        weight="500"
                        height={isMobile ? '24px' : '24px'}
                        color={fontColor3}
                      >
                        Operating since
                      </NewLabel>
                      <NewLabel
                        size={isMobile ? '12px' : '14px'}
                        weight="600"
                        height={isMobile ? '24px' : '24px'}
                        color={fontColor1}
                      >
                        {vaultBirthday === '' ? <AnimatedDots /> : vaultBirthday}{' '}
                        {vaultTotalPeriod !== '' && (
                          <span className="total-days">({vaultTotalPeriod} days)</span>
                        )}
                      </NewLabel>
                    </FlexDiv>
                    <FlexDiv
                      justifyContent="space-between"
                      padding={isMobile ? '10px 15px' : '10px 15px'}
                      borderBottom="1px solid #F3F6FF"
                    >
                      <NewLabel
                        size={isMobile ? '12px' : '14px'}
                        weight="500"
                        height={isMobile ? '24px' : '24px'}
                        color={fontColor3}
                      >
                        SharePrice
                      </NewLabel>
                      <NewLabel
                        size={isMobile ? '12px' : '14px'}
                        weight="600"
                        height={isMobile ? '24px' : '24px'}
                        color={fontColor1}
                      >
                        <div className="question" data-tip data-for="tooltip-sharePrice">
                          {latestSharePrice === '' ? (
                            <AnimatedDots />
                          ) : latestSharePrice === '-' ? (
                            '-'
                          ) : (
                            Number(latestSharePrice).toFixed(5)
                          )}
                        </div>
                        <ReactTooltip
                          id="tooltip-sharePrice"
                          backgroundColor={darkMode ? 'white' : '#101828'}
                          borderColor={darkMode ? 'white' : 'black'}
                          textColor={darkMode ? 'black' : 'white'}
                          place="top"
                        >
                          <NewLabel
                            size={isMobile ? '12px' : '12px'}
                            height={isMobile ? '18px' : '18px'}
                            weight="500"
                          >
                            {latestSharePrice}
                          </NewLabel>
                        </ReactTooltip>
                      </NewLabel>
                    </FlexDiv>
                    <NewLabel
                      display="flex"
                      justifyContent="space-between"
                      size={isMobile ? '12px' : '14px'}
                      weight={isMobile ? '600' : '600'}
                      height={isMobile ? '20px' : '24px'}
                      color={fontColor4}
                      padding={isMobile ? '10px 15px' : '10px 15px'}
                      borderBottom="1px solid #F3F6FF"
                    >
                      {showApyHistory ? 'APY - Live & Historical Average' : 'Harvest Frequency'}
                      <SwitchMode mode={showApyHistory ? 'apy' : 'harvest'}>
                        <div id="theme-switch">
                          <div className="switch-track">
                            <div className="switch-thumb" />
                          </div>
                          <input
                            type="checkbox"
                            checked={showApyHistory}
                            onChange={switchHistory}
                            aria-label="Switch between APY and Harvest frequency"
                          />
                        </div>
                      </SwitchMode>
                    </NewLabel>
                    {showApyHistory
                      ? apyPeriods.map((period, index) => (
                          <FlexDiv
                            key={index}
                            justifyContent="space-between"
                            padding={isMobile ? '10px 15px' : '10px 15px'}
                          >
                            <NewLabel
                              size={isMobile ? '12px' : '14px'}
                              weight="500"
                              height={isMobile ? '24px' : '24px'}
                              color={fontColor3}
                            >
                              {period.label}
                            </NewLabel>
                            <NewLabel
                              size={isMobile ? '12px' : '14px'}
                              weight="600"
                              height={isMobile ? '24px' : '24px'}
                              color={fontColor1}
                            >
                              {period.value === '' ? <AnimatedDots /> : period.value}
                            </NewLabel>
                          </FlexDiv>
                        ))
                      : harvestFrequencies.map((period, index) => (
                          <FlexDiv
                            key={index}
                            justifyContent="space-between"
                            padding={isMobile ? '10px 15px' : '10px 15px'}
                          >
                            <NewLabel
                              size={isMobile ? '12px' : '14px'}
                              weight="500"
                              height={isMobile ? '24px' : '24px'}
                              color={fontColor3}
                            >
                              {period.label}
                            </NewLabel>
                            <NewLabel
                              size={isMobile ? '12px' : '14px'}
                              weight="600"
                              height={isMobile ? '24px' : '24px'}
                              color={fontColor1}
                            >
                              {period.value === '' ? <AnimatedDots /> : period.value}
                            </NewLabel>
                          </FlexDiv>
                        ))}
                  </LastHarvestInfo>
                  <MyBalance
                    marginBottom={isMobile ? '20px' : '25px'}
                    backColor={backColor}
                    borderColor={borderColor}
                  >
                    <NewLabel
                      size={isMobile ? '12px' : '14px'}
                      weight="600"
                      height={isMobile ? '20px' : '24px'}
                      color={fontColor4}
                      padding={isMobile ? '10px 15px' : '10px 15px'}
                      borderBottom="1px solid #F3F6FF"
                    >
                      APY Breakdown
                    </NewLabel>
                    <NewLabel padding={isMobile ? '0px 15px 10px' : '0px 15px 10px'}>
                      <div dangerouslySetInnerHTML={{ __html: rewardTxt }} />
                    </NewLabel>
                  </MyBalance>
                  <LastHarvestInfo backColor={backColor} borderColor={borderColor}>
                    <NewLabel
                      size={isMobile ? '12px' : '14px'}
                      weight="600"
                      height={isMobile ? '20px' : '24px'}
                      color={fontColor4}
                      padding={isMobile ? '10px 15px' : '10px 15px'}
                      borderBottom="1px solid #F3F6FF"
                    >
                      Fees
                    </NewLabel>
                    {feeList.map((feeItem, index) => (
                      <FlexDiv
                        key={index}
                        justifyContent="space-between"
                        padding={isMobile ? '10px 15px' : '10px 15px'}
                      >
                        <NewLabel
                          size={isMobile ? '12px' : '14px'}
                          weight="500"
                          height={isMobile ? '24px' : '24px'}
                          color={fontColor3}
                        >
                          {feeItem.label}
                        </NewLabel>
                        <NewLabel
                          size={isMobile ? '12px' : '14px'}
                          weight="600"
                          height={isMobile ? '24px' : '24px'}
                          color={fontColor1}
                        >
                          {feeItem.value}
                        </NewLabel>
                      </FlexDiv>
                    ))}
                    <FlexDiv
                      justifyContent="space-between"
                      padding={isMobile ? '10px 15px' : '10px 15px'}
                    >
                      <NewLabel
                        size={isMobile ? '13px' : '13px'}
                        weight="300"
                        height="normal"
                        color={fontColor3}
                      >
                        The APY shown already considers the performance fee taken only from
                        generated yield and not deposits.
                      </NewLabel>
                      <NewLabel display="flex" self="center">
                        <PiQuestion className="question" data-tip data-for="tooltip-last-harvest" />
                        <ReactTooltip
                          id="tooltip-last-harvest"
                          backgroundColor={darkMode ? 'white' : '#101828'}
                          borderColor={darkMode ? 'white' : 'black'}
                          textColor={darkMode ? 'black' : 'white'}
                          place={isMobile ? 'left' : 'top'}
                        >
                          <NewLabel
                            weight="500"
                            size={isMobile ? '13px' : '13px'}
                            height={isMobile ? '16px' : '16px'}
                          >
                            <FlexDiv gap="15px" justifyContent="space-between">
                              <div>Harvest Treasury</div>
                              <div>{harvestTreasury}%</div>
                            </FlexDiv>
                            <FlexDiv gap="15px" justifyContent="space-between" marginTop="12px">
                              <div>Profit Sharing</div>
                              <div>{profitShare}%</div>
                            </FlexDiv>
                          </NewLabel>
                        </ReactTooltip>
                      </NewLabel>
                    </FlexDiv>
                  </LastHarvestInfo>
                  {isMobile && (
                    <HalfInfo marginBottom="20px" backColor={backColor} borderColor={borderColor}>
                      <NewLabel
                        weight={700}
                        size="14px"
                        height="24px"
                        padding="10px 15px"
                        borderBottom="1px solid #F3F6FF"
                      >
                        Source of Yield
                      </NewLabel>
                      <DescInfo fontColor6={fontColor6} fontColor3={fontColor3}>
                        <div>
                          <p>
                            This farm supplies{' '}
                            <a
                              href="https://basescan.org/token/0x4200000000000000000000000000000000000006"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              WETH
                            </a>{' '}
                            to Moonwell, a robust lending platform, earning{' '}
                            <a
                              href="https://basescan.org/token/0xFF8adeC2221f9f4D8dfbAFa6B9a297d17603493D"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              WELL
                            </a>{' '}
                            and{' '}
                            <a
                              href="https://basescan.org/token/0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              USDC
                            </a>{' '}
                            from lending activities. At every harvest, the earned rewards are
                            converted into more{' '}
                            <a
                              href="https://basescan.org/token/0x4200000000000000000000000000000000000006"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              WETH
                            </a>
                            .
                          </p>
                        </div>
                      </DescInfo>
                      <FlexDiv className="address" padding="0 15px 20px">
                        {token.vaultAddress && (
                          <InfoLabel
                            display="flex"
                            href={`${getExplorerLink(token.chain)}/address/${token.vaultAddress}`}
                            target="_blank"
                            onClick={e => e.stopPropagation()}
                            rel="noopener noreferrer"
                            bgColor={bgColor}
                            hoverColor={hoverColor}
                            borderColor={borderColor}
                          >
                            <NewLabel
                              size="12px"
                              weight={isMobile ? 600 : 600}
                              height="16px"
                              self="center"
                              color={fontColor1}
                            >
                              Vault Address
                            </NewLabel>
                          </InfoLabel>
                        )}
                        {vaultPool.autoStakePoolAddress && (
                          <InfoLabel
                            display="flex"
                            href={`${getExplorerLink(token.chain)}/address/${
                              vaultPool.contractAddress
                            }`}
                            target="_blank"
                            onClick={e => e.stopPropagation()}
                            rel="noopener noreferrer"
                            bgColor={bgColor}
                            hoverColor={hoverColor}
                            borderColor={borderColor}
                          >
                            <NewLabel
                              size="12px"
                              weight={isMobile ? 600 : 600}
                              height="16px"
                              self="center"
                              color={fontColor1}
                            >
                              Strategy Address
                            </NewLabel>
                          </InfoLabel>
                        )}
                        <InfoLabel
                          display="flex"
                          href={`${getExplorerLink(token.chain)}/address/${
                            vaultPool.autoStakePoolAddress || vaultPool.contractAddress
                          }`}
                          onClick={e => e.stopPropagation()}
                          rel="noopener noreferrer"
                          target="_blank"
                          bgColor={bgColor}
                          hoverColor={hoverColor}
                          borderColor={borderColor}
                        >
                          <NewLabel
                            size="12px"
                            weight={isMobile ? 600 : 600}
                            height="16px"
                            self="center"
                            color={fontColor1}
                          >
                            Pool Address
                          </NewLabel>
                        </InfoLabel>
                      </FlexDiv>
                    </HalfInfo>
                  )}
                </RestInternal>
              ) : (
                <></>
              )}
            </RestContent>
          </InternalSection>
        </BigDiv>
      </Inner>
    </DetailView>
  )
}

export default BeginnersFarm
