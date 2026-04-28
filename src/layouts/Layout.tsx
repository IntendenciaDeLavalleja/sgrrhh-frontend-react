import {
	Button,
	Divider,
	Text,
	Tooltip,
	makeStyles,
	mergeClasses,
	tokens,
} from '@fluentui/react-components'
import {
	ArrowExitRegular,
	CalendarDayRegular,
	DataBarVerticalAscendingRegular,
	DocumentTextRegular,
	HomeRegular,
	PeopleCommunityRegular,
	PersonCircleRegular,
	SettingsRegular,
	WeatherMoonRegular,
	WeatherSunnyRegular,
} from '@fluentui/react-icons'
import type { ComponentType } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'

interface NavItem {
	key: string
	label: string
	path: string
	Icon: ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
	{ key: 'dashboard', label: 'Dashboard', path: '/dashboard', Icon: HomeRegular },
	{ key: 'funcionarios', label: 'Funcionarios', path: '/funcionarios', Icon: PeopleCommunityRegular },
	{ key: 'funcionarios-zafrales', label: 'Funcionarios Zafrales', path: '/funcionarios-zafrales', Icon: PeopleCommunityRegular },
	{ key: 'contratos', label: 'Contratos', path: '/contratos', Icon: DocumentTextRegular },
	{ key: 'asistencias', label: 'Asistencias', path: '/asistencias', Icon: CalendarDayRegular },
	{ key: 'reportes', label: 'Reportes', path: '/reportes', Icon: DataBarVerticalAscendingRegular },
	{ key: 'configuracion', label: 'Configuración', path: '/configuracion', Icon: SettingsRegular },
]

const useStyles = makeStyles({
	root: {
		minHeight: '100vh',
		display: 'flex',
		backgroundColor: tokens.colorNeutralBackground2,
	},

	// ─── Sidebar ──────────────────────────────────────────────
	sidebar: {
		width: '256px',
		flexShrink: '0',
		backgroundColor: tokens.colorNeutralBackground1,
		borderRightWidth: '1px',
		borderRightStyle: 'solid',
		borderRightColor: tokens.colorNeutralStroke2,
		display: 'flex',
		flexDirection: 'column',
		position: 'sticky',
		top: '0',
		height: '100vh',
		overflowY: 'auto',
		overflowX: 'hidden',
		zIndex: 10,
	},

	brandHeader: {
		padding: '20px 16px 16px',
		display: 'flex',
		alignItems: 'center',
		gap: '10px',
		borderBottomWidth: '1px',
		borderBottomStyle: 'solid',
		borderBottomColor: tokens.colorNeutralStroke2,
		marginBottom: '8px',
	},

	brandLogo: {
		width: '36px',
		height: '36px',
		borderRadius: tokens.borderRadiusMedium,
		backgroundColor: tokens.colorBrandBackground,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		color: tokens.colorNeutralForegroundOnBrand,
		fontSize: '16px',
		fontWeight: '700',
		flexShrink: '0',
		boxShadow: `0 2px 8px ${tokens.colorNeutralShadowAmbient}`,
	},

	brandText: {
		display: 'flex',
		flexDirection: 'column',
		gap: '1px',
		overflow: 'hidden',
	},

	sectionLabel: {
		fontSize: tokens.fontSizeBase100,
		fontWeight: tokens.fontWeightSemibold,
		color: tokens.colorNeutralForeground3,
		textTransform: 'uppercase',
		letterSpacing: '0.06em',
		padding: '8px 16px 4px',
	},

	navList: {
		flex: '1',
		padding: '4px 8px',
		display: 'flex',
		flexDirection: 'column',
		gap: '2px',
	},

	navItem: {
		display: 'flex',
		alignItems: 'center',
		gap: '10px',
		padding: '8px 12px',
		borderRadius: tokens.borderRadiusMedium,
		cursor: 'pointer',
		color: tokens.colorNeutralForeground2,
		border: 'none',
		background: 'transparent',
		width: '100%',
		textAlign: 'left',
		fontFamily: 'inherit',
		fontSize: tokens.fontSizeBase300,
		fontWeight: tokens.fontWeightRegular,
		transition: 'background 0.12s ease, color 0.12s ease',
		':hover': {
			backgroundColor: tokens.colorNeutralBackground1Hover,
			color: tokens.colorNeutralForeground1,
		},
	},

	navItemActive: {
		backgroundColor: tokens.colorBrandBackground2,
		color: tokens.colorBrandForeground1,
		fontWeight: tokens.fontWeightSemibold,
		borderLeftWidth: '3px',
		borderLeftStyle: 'solid',
		borderLeftColor: tokens.colorBrandBackground,
		paddingLeft: '9px',
		':hover': {
			backgroundColor: tokens.colorBrandBackground2Hover,
		},
	},

	navIcon: {
		fontSize: '18px',
		display: 'flex',
		alignItems: 'center',
		flexShrink: '0',
	},

	// ─── Bottom section ────────────────────────────────────────
	bottomSection: {
		padding: '8px',
		borderTopWidth: '1px',
		borderTopStyle: 'solid',
		borderTopColor: tokens.colorNeutralStroke2,
		display: 'flex',
		flexDirection: 'column',
		gap: '2px',
	},

	userCard: {
		display: 'flex',
		alignItems: 'center',
		gap: '10px',
		padding: '10px 12px',
		borderRadius: tokens.borderRadiusMedium,
		marginBottom: '4px',
		backgroundColor: tokens.colorNeutralBackground2,
	},

	userInfo: {
		display: 'flex',
		flexDirection: 'column',
		flex: '1',
		overflow: 'hidden',
		gap: '1px',
	},

	userEmail: {
		color: tokens.colorNeutralForeground3,
		fontSize: tokens.fontSizeBase100,
		whiteSpace: 'nowrap',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
	},

	// ─── Main content ──────────────────────────────────────────
	mainWrapper: {
		flex: '1',
		display: 'flex',
		flexDirection: 'column',
		minWidth: '0',
	},

	topbar: {
		height: '52px',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'flex-end',
		gap: '8px',
		padding: '0 24px',
		backgroundColor: tokens.colorNeutralBackground1,
		borderBottomWidth: '1px',
		borderBottomStyle: 'solid',
		borderBottomColor: tokens.colorNeutralStroke2,
		position: 'sticky',
		top: '0',
		zIndex: 5,
	},

	content: {
		flex: '1',
		padding: '28px 28px 40px',
		maxWidth: '1440px',
		width: '100%',
		boxSizing: 'border-box',
	},
})

export function Layout() {
	const styles = useStyles()
	const navigate = useNavigate()
	const location = useLocation()
	const { theme, toggleTheme } = useThemeStore()
	const { user, logout } = useAuthStore()

	return (
		<div className={styles.root}>
			{/* ── Sidebar ── */}
			<aside className={styles.sidebar} aria-label="Navegación principal">
				{/* Brand header */}
				<div className={styles.brandHeader}>
					<div className={styles.brandLogo} aria-hidden="true">
						RH
					</div>
					<div className={styles.brandText}>
						<Text size={300} weight="semibold">
							RRHH Zafral
						</Text>
						<Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>
							Intendencia de Lavalleja
						</Text>
					</div>
				</div>

				{/* Nav label */}
				<p className={styles.sectionLabel} aria-hidden="true">
					Menú principal
				</p>

				{/* Nav items */}
				<nav className={styles.navList}>
					{navItems.map(({ key, label, path, Icon }) => {
						const isActive = location.pathname === path || location.pathname.startsWith(path + '/')
						return (
							<button
								key={key}
								className={mergeClasses(styles.navItem, isActive && styles.navItemActive)}
								onClick={() => navigate(path)}
								aria-current={isActive ? 'page' : undefined}
							>
								<span className={styles.navIcon}>
									<Icon />
								</span>
								{label}
							</button>
						)
					})}
				</nav>

				{/* Bottom: user + actions */}
				<div className={styles.bottomSection}>
					<div className={styles.userCard}>
						<PersonCircleRegular style={{ fontSize: '28px', color: tokens.colorBrandBackground, flexShrink: 0 }} />
						<div className={styles.userInfo}>
							<Text size={200} weight="semibold">{user?.username ?? 'Usuario'}</Text>
							<span className={styles.userEmail}>{user?.email ?? ''}</span>
						</div>
					</div>

					<Tooltip content={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'} relationship="label">
						<button
							className={styles.navItem}
							onClick={toggleTheme}
							aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
						>
							<span className={styles.navIcon}>
								{theme === 'dark' ? <WeatherSunnyRegular /> : <WeatherMoonRegular />}
							</span>
							{theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
						</button>
					</Tooltip>

					<Divider />

					<button
						className={styles.navItem}
						onClick={() => { logout(); navigate('/login') }}
						aria-label="Cerrar sesión"
					>
						<span className={styles.navIcon}>
							<ArrowExitRegular />
						</span>
						Cerrar sesión
					</button>
				</div>
			</aside>

			{/* ── Main area ── */}
			<div className={styles.mainWrapper}>
				{/* Top bar */}
				<header className={styles.topbar}>
					<Button appearance="primary" size="small" onClick={() => navigate('/funcionarios')}>
						+ Nuevo funcionario
					</Button>
					<Button appearance="secondary" size="small" onClick={() => navigate('/reportes')}>
						Exportar
					</Button>
				</header>

				{/* Page content */}
				<main className={styles.content}>
					<Outlet />
				</main>
			</div>
		</div>
	)
}
