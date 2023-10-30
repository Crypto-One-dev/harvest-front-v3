import React, { useState } from 'react'
import Modal from 'react-bootstrap/Modal'
import { useSetChain } from '@web3-onboard/react'
import { Spinner } from 'react-bootstrap'
import { BiGift } from 'react-icons/bi'
import { useMediaQuery } from 'react-responsive'
import WalletIcon from '../../../../assets/images/logos/beginners/wallet-in-button.svg'
import CloseIcon from '../../../../assets/images/logos/beginners/close.svg'
import AlertIcon from '../../../../assets/images/logos/beginners/alert-triangle.svg'
import AlertCloseIcon from '../../../../assets/images/logos/beginners/alert-close.svg'
import ProgressOne from '../../../../assets/images/logos/advancedfarm/progress-step1.png'
import ProgressTwo from '../../../../assets/images/logos/advancedfarm/progress-step2.png'
import ProgressThree from '../../../../assets/images/logos/advancedfarm/progress-step3.png'
import ProgressFour from '../../../../assets/images/logos/advancedfarm/progress-step4.png'
import ProgressFive from '../../../../assets/images/logos/advancedfarm/progress-step5.png'
import AnimatedDots from '../../../AnimatedDots'
import { useWallet } from '../../../../providers/Wallet'
import { usePools } from '../../../../providers/Pools'
import { useActions } from '../../../../providers/Actions'
import { useContracts } from '../../../../providers/Contracts'
import { isSpecialApp } from '../../../../utils'
import { toWei } from '../../../../services/web3'
import Button from '../../../Button'
import {
  FTokenInfo,
  FTokenDiv,
  IconCard,
  BaseSection,
  NewLabel,
  FTokenWrong,
  ImgBtn,
} from './style'

const StakeStart = ({
  stakeStart,
  setStakeStart,
  inputAmount,
  setInputAmount,
  token,
  tokenSymbol,
  fAssetPool,
  lpTokenApprovedBalance,
  setPendingAction,
  multipleAssets,
  setLoadingDots,
  // useIFARM,
}) => {
  const { connected, connectAction, account, chainId, setChainId, getWalletBalances } = useWallet()

  const [
    {
      connectedChain, // the current chain the user's wallet is connected to
    },
    setChain, // function to call to initiate user to switch chains in their wallet
  ] = useSetChain()

  const tokenChain = token.chain || token.data.chain
  const curChain = isSpecialApp
    ? chainId
    : connectedChain
    ? parseInt(connectedChain.id, 16).toString()
    : ''
  const [btnName, setBtnName] = useState('Approve Token')
  const [startSpinner, setStartSpinner] = useState(false)
  const [stakeFailed, setStakeFailed] = useState(false)
  const [progressStep, setProgressStep] = useState(0)
  const [bStakeApprovalSuccess, setBStakeApprovalSuccess] = useState(false)

  const { handleStakeApproval, handleStakeTransaction } = useActions()
  const { contracts } = useContracts()
  const { userStats, fetchUserPoolStats } = usePools()

  // useEffect(() => {
  //   if (bStakeApprovalSuccess) {
  //     setProgressStep(2)
  //     setBtnName('Confirm Transaction')
  //     setStartSpinner(false)
  //   } else {
  //     setStartSpinner(false)
  //     setBtnName('Approve Token')
  //     setStakeFailed(true)
  //     setProgressStep(0)
  //     setBStakeApprovalSuccess(false)
  //   }
  // }, [bStakeApprovalSuccess])

  const onClickStake = async () => {
    if (progressStep === 0) {
      setStartSpinner(true)
      setStakeFailed(false)
      setProgressStep(1)
      setBtnName('Pending Approval in Wallet')
      const stakeAmount = toWei(inputAmount, fAssetPool.lpTokenData.decimals)
      try {
        await handleStakeApproval(
          token,
          account,
          tokenSymbol,
          stakeAmount,
          lpTokenApprovedBalance,
          fAssetPool,
          contracts,
          setPendingAction,
          multipleAssets,
          async () => {
            await fetchUserPoolStats([fAssetPool], account, userStats)
            setBStakeApprovalSuccess(true)
          },
          () => {
            setStartSpinner(false)
            setBtnName('Approve Token')
            setStakeFailed(true)
            setProgressStep(0)
          },
          setBStakeApprovalSuccess,
        )
      } catch (err) {
        setStartSpinner(false)
        setBtnName('Approve Token')
        setStakeFailed(true)
        setProgressStep(0)
      }
      if (bStakeApprovalSuccess) {
        setProgressStep(2)
        setBtnName('Confirm Transaction')
        setStartSpinner(false)
      } else {
        setStartSpinner(false)
        setBtnName('Approve Token')
        // setStakeFailed(true)
        setProgressStep(0)
      }
    } else if (progressStep === 2) {
      setStartSpinner(true)
      setProgressStep(3)
      setBtnName('Pending Confirmation in Wallet')
      let bStakeSuccess = false
      const stakeAmount = toWei(inputAmount, fAssetPool.lpTokenData.decimals)
      try {
        await handleStakeTransaction(
          account,
          tokenSymbol,
          stakeAmount,
          fAssetPool,
          contracts,
          setPendingAction,
          multipleAssets,
          async () => {
            setLoadingDots(false, true)
            await fetchUserPoolStats([fAssetPool], account, userStats)
            await getWalletBalances([tokenSymbol], false, true)
            setLoadingDots(false, false)
            bStakeSuccess = true
          },
          () => {
            setStartSpinner(false)
            setBtnName('Approve Token')
            setStakeFailed(true)
            setProgressStep(0)
          },
        )
      } catch (err) {
        setStartSpinner(false)
        setBtnName('Approve Token')
        setStakeFailed(true)
        setProgressStep(0)
      }
      if (bStakeSuccess) {
        setProgressStep(4)
        setBtnName('Success! Close this Window.')
        setStakeFailed(false)
        setStartSpinner(false)
      } else {
        setStartSpinner(false)
        setBtnName('Approve Token')
        setStakeFailed(true)
        setProgressStep(0)
      }
    } else if (progressStep === 4) {
      setProgressStep(0)
      setBtnName('Approve Token')
      setStakeFailed(false)
      setStakeStart(false)
      setInputAmount(0)
    }
  }

  const isMobile = useMediaQuery({ query: '(max-width: 992px)' })

  return (
    <Modal
      show={stakeStart}
      // onHide={onClose}
      dialogClassName="modal-notification"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header className="deposit-modal-header">
        <FTokenInfo>
          <FTokenDiv>
            <NewLabel margin="auto 0px">
              <IconCard>
                <BiGift />
              </IconCard>
            </NewLabel>
            <NewLabel align="left" marginRight="12px">
              <NewLabel
                color="#15B088"
                size={isMobile ? '12px' : '18px'}
                height={isMobile ? '17px' : '28px'}
                weight="600"
                marginBottom="4px"
              >
                Summary
              </NewLabel>
              <NewLabel
                color="#15202B"
                size={isMobile ? '12px' : '14px'}
                height={isMobile ? '17px' : '20px'}
                weight="400"
                marginBottom="5px"
              >
                Stake your fTokens to earn extra token rewards
              </NewLabel>
            </NewLabel>
          </FTokenDiv>
          <NewLabel>
            <NewLabel
              display="flex"
              marginBottom={isMobile ? '0px' : '16px'}
              width="fit-content"
              cursorType="pointer"
              weight="600"
              size={isMobile ? '12px' : '14px'}
              height={isMobile ? '17px' : '20px'}
              color="#667085"
              align="center"
              onClick={() => {
                setStakeStart(false)
                setProgressStep(0)
                setStakeFailed(false)
                setStartSpinner(false)
                setBtnName('Approve Token')
              }}
            >
              <ImgBtn src={CloseIcon} alt="" />
            </NewLabel>
          </NewLabel>
        </FTokenInfo>
      </Modal.Header>
      <Modal.Body className="deposit-modal-body">
        <BaseSection>
          <NewLabel
            size={isMobile ? '10px' : '14px'}
            height={isMobile ? '18px' : '24px'}
            padding="15px 24px 10px"
            color="#344054"
          >
            <NewLabel
              display="flex"
              justifyContent="space-between"
              padding={isMobile ? '5px 0' : '10px 0'}
            >
              <NewLabel weight="500">{progressStep === 4 ? 'Staked' : 'Staking'}</NewLabel>
              <NewLabel display="flex" flexFlow="column" weight="600" align="right">
                <>{inputAmount !== '' ? inputAmount : <AnimatedDots />}</>
                <span>{tokenSymbol !== '' ? `f${tokenSymbol}` : <AnimatedDots />}</span>
              </NewLabel>
            </NewLabel>
          </NewLabel>

          <FTokenWrong isShow={stakeFailed ? 'true' : 'false'}>
            <NewLabel marginRight="12px" display="flex">
              <div>
                <img src={AlertIcon} alt="" />
              </div>
              <NewLabel marginLeft="12px">
                <NewLabel
                  color="#B54708"
                  size={isMobile ? '10px' : '14px'}
                  height={isMobile ? '15px' : '20px'}
                  weight="600"
                  marginBottom="4px"
                >
                  Whoops, something went wrong.
                </NewLabel>
                <NewLabel
                  color="#B54708"
                  size={isMobile ? '12px' : '14px'}
                  height={isMobile ? '17px' : '20px'}
                  weight="400"
                  marginBottom="5px"
                >
                  Please try to repeat the transaction in your wallet.
                </NewLabel>
              </NewLabel>
            </NewLabel>
            <NewLabel>
              <ImgBtn
                src={AlertCloseIcon}
                alt=""
                onClick={() => {
                  setStakeFailed(false)
                }}
              />
            </NewLabel>
          </FTokenWrong>

          <NewLabel>
            <img
              className="progressbar-img"
              src={
                progressStep === 0
                  ? ProgressOne
                  : progressStep === 1
                  ? ProgressTwo
                  : progressStep === 2
                  ? ProgressThree
                  : progressStep === 3
                  ? ProgressFour
                  : ProgressFive
              }
              alt="progress bar"
            />
          </NewLabel>

          <NewLabel padding={isMobile ? '0 7px' : '24px'}>
            <Button
              color="wido-deposit"
              width="100%"
              onClick={async () => {
                if (!connected) {
                  connectAction()
                  return
                }
                if (curChain !== tokenChain) {
                  const chainHex = `0x${Number(tokenChain).toString(16)}`
                  if (!isSpecialApp) {
                    await setChain({ chainId: chainHex })
                    setChainId(tokenChain)
                  }
                } else {
                  onClickStake()
                }
              }}
            >
              {btnName}
              {!connected ? <img src={WalletIcon} alt="" /> : <></>}
              {!startSpinner ? (
                <></>
              ) : (
                <>
                  &nbsp;&nbsp;
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                </>
              )}
            </Button>
          </NewLabel>
        </BaseSection>
      </Modal.Body>
    </Modal>
  )
}
export default StakeStart
