import styled from 'styled-components'

export const Container = styled.div`
  padding: 20px 0px 10px 0px;
`

export const ContentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;

  @media (min-width: 576px) {
    flex-direction: row;
    align-items: center;
  }

  > h2 {
    margin-right: 30px;
    font-size: 26px;
    font-weight: 700;
    margin-bottom: 10px;
  }
`

export const FilterGroup = styled.div`
  display: flex;
  margin-bottom: 10px;
  > div:last-child {
    margin-left: 10px;
  }
`

export const Option = styled.div`
  display: flex;
  align-items: center;
  padding: 5px;

  > span {
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
  }
`

export const MarketListWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  margin-left: 0px;
  padding-top: 20px;
  > div {
    width: 100%;
    margin: 15px 0px;
  }

  @media (min-width: 576px) {
    width: calc(100% + 20px);
    margin-left: -10px;
    > div {
      margin: 10px;
      width: calc(50% - 20px);
    }
  }

  @media (min-width: 768px) {
    width: calc(100% + 20px);
    margin-left: -10px;
    > div {
      margin: 10px;
      width: calc(33.33% - 20px);
    }
  }

  @media (min-width: 994px) {
    width: calc(100% + 30px);
    margin-left: -15px;
    > div {
      margin: 15px;
      width: calc(25% - 30px);
    }
  }
`

export const FilterButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  button {
    margin: 15px 10px 15px 0px;
    svg {
      margin-left: 5px;
      color: white;
    }
  }
`