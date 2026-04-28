import { Button, Field, Input, MessageBar, MessageBarBody, Spinner, Text, makeStyles, tokens } from '@fluentui/react-components'
import { ArrowLeftRegular, LockClosedRegular, PersonRegular } from '@fluentui/react-icons'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { useAuthStore } from '../store/authStore'

const useStyles = makeStyles({
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colorNeutralBackground2,
    padding: '16px',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusXLarge,
    padding: '40px 36px',
    borderTopWidth: '1px',
    borderRightWidth: '1px',
    borderBottomWidth: '1px',
    borderLeftWidth: '1px',
    borderTopStyle: 'solid',
    borderRightStyle: 'solid',
    borderBottomStyle: 'solid',
    borderLeftStyle: 'solid',
    borderTopColor: tokens.colorNeutralStroke2,
    borderRightColor: tokens.colorNeutralStroke2,
    borderBottomColor: tokens.colorNeutralStroke2,
    borderLeftColor: tokens.colorNeutralStroke2,
    boxShadow: `0 8px 40px ${tokens.colorNeutralShadowAmbient}, 0 2px 8px ${tokens.colorNeutralShadowKey}`,
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  logoSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '4px',
  },
  logoIcon: {
    width: '56px',
    height: '56px',
    borderRadius: tokens.borderRadiusLarge,
    backgroundColor: tokens.colorBrandBackground,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    color: tokens.colorNeutralForegroundOnBrand,
    boxShadow: `0 4px 16px ${tokens.colorNeutralShadowAmbient}`,
  },
  fields: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  captchaBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  captchaQuestion: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusMedium,
    padding: '10px 14px',
    borderTopWidth: '1px',
    borderRightWidth: '1px',
    borderBottomWidth: '1px',
    borderLeftWidth: '1px',
    borderTopStyle: 'solid',
    borderRightStyle: 'solid',
    borderBottomStyle: 'solid',
    borderLeftStyle: 'solid',
    borderTopColor: tokens.colorNeutralStroke1,
    borderRightColor: tokens.colorNeutralStroke1,
    borderBottomColor: tokens.colorNeutralStroke1,
    borderLeftColor: tokens.colorNeutralStroke1,
  },
  captchaQuestionText: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground1,
    fontFamily: 'monospace',
    letterSpacing: '0.05em',
  },
  footer: {
    textAlign: 'center',
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase100,
    paddingTop: '4px',
  },
  twoFaInfo: {
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusMedium,
    padding: '12px 14px',
    textAlign: 'center',
  },
})

type Step = 'credentials' | 'twofa'

export function LoginPage() {
  const navigate = useNavigate()
  const styles = useStyles()
  const { setAuth, isAuthenticated } = useAuthStore()

  const [step, setStep] = useState<Step>('credentials')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [captchaLeft, setCaptchaLeft] = useState(0)
  const [captchaRight, setCaptchaRight] = useState(0)
  const [captchaAnswer, setCaptchaAnswer] = useState('')
  const [twoFACode, setTwoFACode] = useState('')
  const [pendingToken, setPendingToken] = useState('')
  const [emailPreview, setEmailPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const newCaptcha = () => {
    setCaptchaLeft(Math.floor(Math.random() * 8) + 1)
    setCaptchaRight(Math.floor(Math.random() * 8) + 1)
    setCaptchaAnswer('')
  }

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    } else {
      newCaptcha()
    }
  }, [])

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Ingrese correo y contraseña')
      return
    }
    if (!captchaAnswer) {
      setError('Debe responder el captcha')
      return
    }
    if (parseInt(captchaAnswer, 10) !== captchaLeft + captchaRight) {
      setError('Captcha incorrecto')
      newCaptcha()
      return
    }
    setError(null)
    setLoading(true)
    try {
      const result = await authService.login({
        email,
        password,
      })
      if (result.requires_2fa) {
        setEmailPreview(result.email_preview)
        setPendingToken(result.pending_token)
        setStep('twofa')
      }
    } catch (err: unknown) {
      const e = err as { message?: string; code?: string; response?: { status?: number; data?: { error?: string } } }
      const apiError = e?.response?.data?.error
      const status = e?.response?.status
      let msg: string
      if (apiError) {
        msg = apiError
      } else if (status) {
        msg = `Error del servidor (HTTP ${status})`
      } else if (e?.code === 'ERR_NETWORK' || e?.message === 'Network Error') {
        msg = 'No se puede conectar con el servidor'
      } else {
        msg = e?.message || 'Error al iniciar sesion'
      }
      setError(msg)
      newCaptcha()
    } finally {
      setLoading(false)
    }
  }

  const handleVerify2FA = async () => {
    if (!twoFACode) {
      setError('Ingrese el codigo de verificacion')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const result = await authService.verify2FA(twoFACode, pendingToken)
      if (result.success) {
        setAuth(result.access_token, result.expires_in, result.user)
        navigate('/dashboard', { replace: true })
      }
    } catch (err: unknown) {
      const e = err as { message?: string; code?: string; response?: { status?: number; data?: { error?: string } } }
      const apiError = e?.response?.data?.error
      const status = e?.response?.status
      let msg: string
      if (apiError) {
        msg = apiError
      } else if (status) {
        msg = `Error del servidor (HTTP ${status})`
      } else if (e?.code === 'ERR_NETWORK' || e?.message === 'Network Error') {
        msg = 'No se puede conectar con el servidor'
      } else {
        msg = e?.message || 'Codigo invalido o expirado'
      }
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleBackToLogin = () => {
    setStep('credentials')
    setTwoFACode('')
    setError(null)
    newCaptcha()
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoSection}>
          <div className={styles.logoIcon} aria-hidden="true">
            {step === 'twofa' ? <LockClosedRegular /> : <PersonRegular />}
          </div>
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Text size={600} weight="semibold">
              {step === 'twofa' ? 'Verificacion' : 'Bienvenido'}
            </Text>
            <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
              Sistema de RRHH Zafral - Intendencia de Lavalleja
            </Text>
          </div>
        </div>

        {error && (
          <MessageBar intent="error">
            <MessageBarBody>{error}</MessageBarBody>
          </MessageBar>
        )}

        {step === 'credentials' && (
          <div className={styles.fields}>
            <Field label="Correo institucional">
              <Input
                type="email"
                placeholder="nombre@intendencia.gub.uy"
                size="large"
                value={email}
                onChange={(_, d) => setEmail(d.value)}
                disabled={loading}
              />
            </Field>
            <Field label="Contrasena">
              <Input
                type="password"
                placeholder="........"
                size="large"
                value={password}
                onChange={(_, d) => setPassword(d.value)}
                disabled={loading}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </Field>

            <Field label="Verificacion de seguridad">
              <div className={styles.captchaBox}>
                <div className={styles.captchaQuestion}>
                  <span className={styles.captchaQuestionText}>
                    ¿Cuánto es {captchaLeft} + {captchaRight}?
                  </span>
                </div>
                <Input
                  type="number"
                  placeholder="Respuesta"
                  size="large"
                  value={captchaAnswer}
                  onChange={(_, d) => setCaptchaAnswer(d.value)}
                  disabled={loading}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
            </Field>

            <Button
              appearance="primary"
              size="large"
              style={{ width: '100%' }}
              onClick={handleLogin}
              disabled={loading}
              icon={loading ? <Spinner size="tiny" /> : undefined}
            >
              {loading ? 'Verificando...' : 'Ingresar al sistema'}
            </Button>
          </div>
        )}

        {step === 'twofa' && (
          <div className={styles.fields}>
            <div className={styles.twoFaInfo}>
              <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>
                Se envio un codigo de 6 digitos a
              </Text>
              <br />
              <Text size={300} weight="semibold">
                {emailPreview}
              </Text>
            </div>

            <Field label="Codigo de verificacion">
              <Input
                type="text"
                placeholder="000000"
                size="large"
                value={twoFACode}
                onChange={(_, d) => setTwoFACode(d.value)}
                disabled={loading}
                onKeyDown={(e) => e.key === 'Enter' && handleVerify2FA()}
                maxLength={6}
              />
            </Field>

            <Button
              appearance="primary"
              size="large"
              style={{ width: '100%' }}
              onClick={handleVerify2FA}
              disabled={loading}
              icon={loading ? <Spinner size="tiny" /> : undefined}
            >
              {loading ? 'Verificando...' : 'Confirmar codigo'}
            </Button>

            <Button
              appearance="subtle"
              size="medium"
              style={{ width: '100%' }}
              onClick={handleBackToLogin}
              disabled={loading}
              icon={<ArrowLeftRegular />}
            >
              Volver al inicio de sesion
            </Button>
          </div>
        )}

        <p className={styles.footer}>
          Acceso restringido a personal autorizado
        </p>
      </div>
    </div>
  )
}
