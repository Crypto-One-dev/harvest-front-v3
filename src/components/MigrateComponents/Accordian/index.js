import React, { useState } from 'react'
import { NewLabel } from '../PositionModal/style'

const Accordian = ({ text, EXPANDED, COLLAPSED, darkMode }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleExpand = () => {
    setIsExpanded(prev => !prev)
  }

  return (
    <NewLabel
      display="flex"
      paddingBottom="32px"
      marginBottom="24px"
      flexDirection="column"
      borderBottom="1px solid #EAECF0"
      cursorType="pointer"
      onClick={() => {
        handleExpand()
      }}
    >
      <NewLabel display="flex" justifyContent="space-between" alignItems="center">
        <NewLabel
          size="15.37px"
          height="23.91px"
          weight="500"
          color={darkMode ? '#ffffff' : '#101828'}
        >
          {text.question}
        </NewLabel>
        <img src={isExpanded ? EXPANDED : COLLAPSED} alt="" />
      </NewLabel>
      {isExpanded && (
        <NewLabel
          size="13.66px"
          weight="400"
          height="20.49px"
          color={darkMode ? '#ffffff' : '#475467'}
        >
          {text.answer}
        </NewLabel>
      )}
    </NewLabel>
  )
}

export default Accordian
