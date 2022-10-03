import React from 'react'
import { LayoutContainer } from '../../../shared'
import { Button } from '../../../../styles'
import { useTheme } from 'styled-components'
import {
  ComponentWraper,
  Container,
  LeftWrapper,
  RightWrapper,
  ButtonGroup,
  ImgWrapper
} from './styles'

export const LmwrHero = () => {
  const theme = useTheme()

  return (
    <ComponentWraper>
      <LayoutContainer>
        <Container>
          <LeftWrapper>
            <h1>
              <span className="marker">Block Reward Token What it is</span> <span className="marker">and how it works</span>
            </h1>
            <h2>
            Block Reward Token is earned on purchases made from a business within our ecosystem, think of BRT as a reward point. Our token is used to redeem discounts, limited-time offers and other promotional activities offered by businesses on our platform. Users can also use the token to upgrade their membership tier within the system. There may be ways to gain more BRT in the future through our platform. 
            Our token is hosted on the Algorand Blockchain, doing this allows for easy accounting of tokens in circulations and can provide business analytics through its public ledger.
              {/* <br /><br />
              Join our waitlist to stay up-to-date: */}
            </h2>
            {/* <ButtonGroup>
              <Button color='primary'>Get Notified</Button>
            </ButtonGroup> */}
          </LeftWrapper>
          <RightWrapper>
            <ImgWrapper>
              {/* <h2>Timeline</h2> */}
              <img src={theme.images.timeLine} alt='' />
            </ImgWrapper>
          </RightWrapper>
        </Container>
      </LayoutContainer>
    </ComponentWraper>
  )
}
