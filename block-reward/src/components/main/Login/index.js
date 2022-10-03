import React, { useState } from 'react'
import { LayoutContainer } from '../../shared'
import { useNavigate } from 'react-router-dom'
import GoVerified from '@meronex/icons/go/GoVerified'
import { Button, Input } from '../../../styles'
import AiFillEye from '@meronex/icons/ai/AiFillEye'
import { useForm } from 'react-hook-form'
import { useApi } from '../../../contexts/ApiContext'
import { useSession } from '../../../contexts/SessionContext'
import { toast } from 'react-toastify'

import {
  Container,
  LeftWrapper,
  RightWrapper,
  Details,
  DetailContent,
  Head,
  Heading,
  HeadDes,
  FormWraper,
  FormRow,
  FormLabel,
  ForogLink,
  InputWrapper,
  ErrorMessage
} from './styles'

export const Login = () => {
  const nagative = useNavigate()
  const [{ doPost }] = useApi()
  const [, { login }] = useSession()
  const { register, handleSubmit, formState: { errors }} = useForm()

  const [isShowPassword, setIsShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const onSubmit = async (values) => {
    try {
      setIsLoading(true)
      const response = await doPost('/auth/login', values)
      console.log(response, 'res')
      if (response.error) {
        throw response.result
        setIsLoading(false)
      }
      else {
        toast('Success', { type: 'success' })
        console.log(response.email, 'res_email')
        localStorage.setItem('user_email', response.email)
        localStorage.setItem('user_id', JSON.stringify(response.id), true)
        setIsLoading(false)
        await login(response.token)
        nagative('/u/dashboard')
      }
      
    } catch (error) {
      setIsLoading(false)
      toast(error, { type: 'error' })
    }
  }

  return (
    <LayoutContainer>
      <Container>
        <LeftWrapper onClick={() => nagative('/landing/aitch/')}>
          <img src="https://limewire.com/hc_content_aitch_cover.92bbc219.jpg" alt='' />
          <Details>
            <div>
              <div>Close To Home</div>
              <DetailContent>
                <img src='https://d2tg7hjmtin7hh.cloudfront.net/thumbs/creator_page_avatar/2843/28433c6b-8efa-453f-bd4f-73b4314862fc_small.png' alt='' />
                <span>Aitch</span>
                <GoVerified />
              </DetailContent>
            </div>
            <div>
              Cooming Soon
            </div>
          </Details>
        </LeftWrapper>

        <RightWrapper>
          <Head>
            <Heading>Log In</Heading>
            <HeadDes>Log in to your BlockReward account</HeadDes>
          </Head>
          <FormWraper onSubmit={handleSubmit(onSubmit)}>
            <FormRow error={errors?.email}>
              <FormLabel>EMAIL</FormLabel>
              <Input
                placeholder='Enter email address'
                autoComplete='off'
                {...register(
                  'email',
                  {
                    required: {
                      value: true,
                      message: 'The field is required*'
                    },
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  }
                )}
              />
              {errors?.email && <ErrorMessage>{errors?.email?.message}</ErrorMessage>}
            </FormRow>
            <FormRow error={errors?.password}>
              <FormLabel>
                <span>Password</span>
                <ForogLink onClick={() => nagative('/forgot-password')}>Forgot Password?</ForogLink>
              </FormLabel>
              <InputWrapper>
                <Input
                  type={isShowPassword ? 'text' : 'password'}
                  autoComplete='off'
                  {...register(
                    'password',
                    {
                      required: {
                        value: true,
                        message: 'The field is required*'
                      },
                      maxLength: {
                        value: 30,
                        message: `The characters must be less than 30`
                      },
                      minLength: {
                        value: 8,
                        message: `The characters must be more than 8`
                      }
                    }
                  )}
                />
                <AiFillEye onClick={()=>{setIsShowPassword(!isShowPassword)}}/>
              </InputWrapper>
              {errors?.password && <ErrorMessage>{errors?.password?.message}</ErrorMessage>}
            </FormRow>
            <FormRow>
              <Button
                color="primary"
                type='submit'
                isLoading={isLoading}
              >
                Login
              </Button>
            </FormRow>
            <FormRow>
              BlockReward <a href="./terms" target="_blank" rel="noreferrer">Terms and Conditions</a> and <a href="./privacy" target="_blank" rel="noreferrer">Privacy Policy</a> apply. This site is protected by Google reCAPTCHA.
            </FormRow>
          </FormWraper>
        </RightWrapper>
      </Container>
    </LayoutContainer>
  )
}