import React from 'react'
import { useMediaQuery } from 'react-responsive'
import { PiQuestion } from 'react-icons/pi'
import ReactTooltip from 'react-tooltip'
import ListItem from '../ListItem'
import { useThemeContext } from '../../../providers/useThemeContext'
import TrendUp from '../../../assets/images/logos/advancedfarm/trend-up.svg'
import TrendDown from '../../../assets/images/logos/advancedfarm/trend-down.svg'
import { formatDateTime, formatDateTimeMobile } from '../../../utilities/formats'
import { Content, DetailView, FlexDiv, IconWrapper, Badge, NetImg, NewLabel } from './style'

const ActionRow = ({ info, tokenSymbol, showTotalBalance }) => {
  const isMobile = useMediaQuery({ query: '(max-width: 992px)' })
  const { switchMode, backColor, borderColor, hoverColor, fontColor } = useThemeContext()

  return (
    <DetailView
      borderColor={borderColor}
      hoverColor={hoverColor}
      mode={switchMode}
      background={backColor}
    >
      <FlexDiv padding={isMobile ? '10px' : '0'}>
        <Content display="flex" width={isMobile ? '23%' : '20%'}>
          <Badge
            bgColor={
              info.event === 'Revert'
                ? '#FEF3F2'
                : info.event === 'Convert'
                ? '#fdeccf'
                : info.netChange > 0
                ? '#ecfdf3'
                : '#FEF3F2'
            }
            color={
              info.event === 'Revert'
                ? '#B42318'
                : info.event === 'Convert'
                ? '#FF9400'
                : info.netChange > 0
                ? '#027a48'
                : '#B42318'
            }
          >
            {info.event}
          </Badge>
          {info.event === 'Harvest' && info.netChange < 0 && (
            <IconWrapper>
              <PiQuestion className="question" data-tip data-for="harvest-event-minus" />
              <ReactTooltip
                id="harvest-event-minus"
                backgroundColor="#101828"
                borderColor="black"
                textColor="white"
              >
                <NewLabel
                  size={isMobile ? '12px' : '12px'}
                  height={isMobile ? '18px' : '18px'}
                  weight="500"
                  color="white"
                >
                  In certain strategies, a negative yield event might occur, resulting in a minor
                  reduction of the underlying.
                  <br />
                  <br />
                  If you have any questions, open a ticket in our Discord.
                </NewLabel>
              </ReactTooltip>
            </IconWrapper>
          )}
        </Content>
        <Content
          width={isMobile ? '20%' : '20%'}
          color={fontColor}
          paddingRight={isMobile ? '8px' : '0px'}
        >
          {isMobile ? (
            <div
              className="timestamp"
              dangerouslySetInnerHTML={formatDateTimeMobile(info.timestamp)}
            />
          ) : (
            <div className="timestamp" dangerouslySetInnerHTML={formatDateTime(info.timestamp)} />
          )}
        </Content>
        {!isMobile ? (
          <>
            <Content width="30%">
              <ListItem weight={500} size={14} height={20} color="#8884D8" value={info.balance} />
              <ListItem
                weight={500}
                size={14}
                height={20}
                color="#5FCF76"
                value={`≈${info.balanceUsd}`}
              />
              <ListItem weight={400} size={14} height={20} color={fontColor} value={tokenSymbol} />
            </Content>
            <Content display={isMobile ? 'none' : 'flex'} width="30%">
              <NetImg>
                <img src={info.netChange > 0 ? TrendUp : TrendDown} alt="trend" />
              </NetImg>
              <div>
                <ListItem
                  weight={500}
                  size={14}
                  height={20}
                  color="#8884D8"
                  value={info.netChange}
                />
                <ListItem
                  weight={500}
                  size={14}
                  height={20}
                  color="#5FCF76"
                  value={`${info.netChangeUsd === '<$0.01' ? '' : '≈'}${info.netChangeUsd}`}
                />
                <ListItem
                  weight={400}
                  size={14}
                  height={20}
                  color={fontColor}
                  value={tokenSymbol}
                />
              </div>
            </Content>
          </>
        ) : showTotalBalance ? (
          <Content width="57%">
            <ListItem weight={500} size={12} height={20} color="#8884D8" value={info.balance} />
            <ListItem
              weight={500}
              size={12}
              height={20}
              color="#5FCF76"
              value={`≈${info.balanceUsd}`}
            />
            <ListItem weight={400} size={12} height={20} color={fontColor} value={tokenSymbol} />
          </Content>
        ) : (
          <Content display="flex" width="57%">
            <NetImg>
              <img src={info.netChange > 0 ? TrendUp : TrendDown} alt="trend" />
            </NetImg>
            <div>
              <ListItem weight={500} size={12} height={20} color="#8884D8" value={info.netChange} />
              <ListItem
                weight={500}
                size={12}
                height={20}
                color="#5FCF76"
                value={`${info.netChangeUsd === '<$0.01' ? '' : '≈'}${info.netChangeUsd}`}
              />
              <ListItem weight={400} size={12} height={20} color={fontColor} value={tokenSymbol} />
            </div>
          </Content>
        )}
      </FlexDiv>
    </DetailView>
  )
}
export default ActionRow
