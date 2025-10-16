import React from 'react'
import { ChevronDown, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getSidebarItems } from './sidebarItems'
import { useAuthStore } from '../../../store/v1authStore'
import { motion, AnimatePresence } from 'framer-motion'

type SidebarProps = {
	collapsed: boolean
	onPageChange?: (id: string) => void
	activeItem: string
}

function Sidebar({ collapsed, onPageChange, activeItem }: SidebarProps) {
	const [expandedItem, setExpandedItem] = React.useState<Set<string>>(new Set([""]))
	const [activeSubItem, setActiveSubItem] = React.useState<string | null>(null)
	const [isMobile, setIsMobile] = React.useState(false)
	const navigate = useNavigate()
	const { logout, isLoggingOut, currentUser } = useAuthStore()
	
	// Get sidebar items based on user role and system role
	const sidebarItems = getSidebarItems(currentUser?.role, currentUser?.system_role)

	// Handle responsive behavior
	React.useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth < 768)
		}
		
		handleResize() // Set initial value
		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [])

	const toggleExpanded = (itemid: string) => {
		const newExpanded = new Set(expandedItem)
		if (newExpanded.has(itemid)) {
			// If clicking the same item, just close it
			newExpanded.delete(itemid)
		} else {
			// If clicking a different item, close all others and open this one
			newExpanded.clear()
			newExpanded.add(itemid)
		}
		setExpandedItem(newExpanded)
	}

	const handleLogout = async () => {
		try {
			await logout()
			// Redirect to login page after successful logout
			navigate('/', { replace: true })
		} catch {
			// Even if logout fails, redirect to login page
			navigate('/', { replace: true })
		}
	}

	const shouldCollapse = collapsed && !isMobile

	return (
		<div className="flex">
			<motion.div 
				className={`bg-white border-r border-slate-200/50 flex flex-col dark:bg-slate-900 dark:border-slate-700 h-screen min-h-screen shadow-lg md:shadow-none`}
				animate={{ 
					width: shouldCollapse ? 64 : 256,
				}}
				transition={{ 
					type: "spring", 
					damping: 25, 
					stiffness: 200,
					duration: 0.3
				}}
			>
				<motion.div 
					className="flex-shrink-0"
					animate={{ 
						padding: shouldCollapse ? 12 : 24,
					}}
					transition={{ 
						type: "spring", 
						damping: 25, 
						stiffness: 200,
						duration: 0.3
					}}
				>
					<div className='flex items-center space-x-3'>
						<div className='w-10 h-10 flex items-center justify-center text-white text-xl font-bold flex-shrink-0 bg-orange-500 rounded-lg'>
							{/* Try to load image, fallback to text if it fails */}
							<img 
								src="/GSM_logo.png" 
								alt="GSM Logo" 
								className="w-full h-full object-contain"
								onError={(e) => {
									e.target.style.display = 'none';
									const fallback = e.target.parentElement.querySelector('.logo-fallback');
									if (fallback) fallback.style.display = 'block';
								}}
							/>
							<span className="logo-fallback hidden text-white font-bold text-lg">GSM</span>
						</div>
						<AnimatePresence>
							{!shouldCollapse && (
								<motion.div 
									className="min-w-0"
									initial={{ opacity: 0, width: 0 }}
									animate={{ opacity: 1, width: "auto" }}
									exit={{ opacity: 0, width: 0 }}
									transition={{ 
										duration: 0.2,
										ease: "easeInOut"
									}}
								>
									<h1 className='text-lg md:text-xl font-bold dark:text-white truncate'>GSM</h1>
									<p className='text-xs text-slate-500 truncate'>Admin Dashboard</p>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</motion.div>
				<hr className='border-slate-200 dark:border-slate-700 mx-2 flex-shrink-0' />
				<nav className='flex-1 p-2 md:p-4 space-y-1 md:space-y-2 overflow-y-auto'>
					{sidebarItems.map((item, index) => (
						<motion.div 
							key={item.id}
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ 
								delay: index * 0.1,
								duration: 0.3,
								ease: "easeOut"
							}}
						>
							<motion.button
								className={`w-full flex justify-between items-center p-2 md:p-2 rounded-xl transition-all duration-200 text-left ${shouldCollapse ? 'px-2' : 'px-3'} ${(activeItem === item.id || ((item as any).subItems && (item as any).subItems.some((sub: any) => sub.id === activeSubItem))) ? 'bg-orange-200 text-orange-600 font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:text-slate-600 dark:hover:bg-slate-200'}`}
								onClick={() => {
									if ((item as any).subItems) {
										toggleExpanded(item.id)
										if ((item as any).subItems.length > 0) {
											setActiveSubItem((item as any).subItems[0].id)
											if (onPageChange) onPageChange((item as any).subItems[0].id)
										}
									} else {
										setActiveSubItem(null)
										if (onPageChange) onPageChange(item.id)
									}
								}}
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
							>
								<div className='flex items-center space-x-3 min-w-0'>
									<item.icon className='w-5 h-5 flex-shrink-0' />
									<AnimatePresence>
										{!shouldCollapse && (
											<motion.span 
												className='text-sm font-medium truncate'
												initial={{ opacity: 0, width: 0 }}
												animate={{ opacity: 1, width: "auto" }}
												exit={{ opacity: 0, width: 0 }}
												transition={{ 
													duration: 0.2,
													ease: "easeInOut"
												}}
											>
												{item.label}
											</motion.span>
										)}
									</AnimatePresence>
								</div>
								<AnimatePresence>
									{!shouldCollapse && (item as any).subItems && (
										<motion.div
											initial={{ opacity: 0, rotate: -90 }}
											animate={{ opacity: 1, rotate: 0 }}
											exit={{ opacity: 0, rotate: -90 }}
											transition={{ 
												duration: 0.2,
												ease: "easeInOut"
											}}
										>
											<ChevronDown className={`${expandedItem.has(item.id) ? 'rotate-180' : ''} w-4 h-4 text-slate-500 transition-transform duration-200 flex-shrink-0`} />
										</motion.div>
									)}
								</AnimatePresence>
							</motion.button>
							<AnimatePresence>
								{!shouldCollapse && (item as any).subItems && expandedItem.has(item.id) && (
									<motion.div 
										className='ml-6 md:ml-8 mt-2 space-y-1 border-l border-slate-300 pl-2'
										initial={{ opacity: 0, height: 0 }}
										animate={{ opacity: 1, height: "auto" }}
										exit={{ opacity: 0, height: 0 }}
										transition={{ 
											duration: 0.3,
											ease: "easeInOut"
										}}
									>
										{(item as any).subItems.map((subitem: any, subIndex: number) => (
											<motion.button
												key={subitem.id}
												className={`w-full text-sm text-left p-2 rounded-lg transition-colors duration-200 ${activeSubItem === subitem.id ? 'bg-orange-100 text-orange-700 font-semibold' : 'text-slate-700 dark:text-slate-500 hover:bg-slate-200 dark:hover:text-slate-600 dark:hover:bg-slate-100'}`}
												onClick={() => {
													setActiveSubItem(subitem.id)
													if (onPageChange) onPageChange(subitem.id)
												}}
												initial={{ opacity: 0, x: -10 }}
												animate={{ opacity: 1, x: 0 }}
												transition={{ 
													delay: subIndex * 0.05,
													duration: 0.2,
													ease: "easeOut"
												}}
												whileHover={{ scale: 1.02 }}
												whileTap={{ scale: 0.98 }}
											>
												<span className="truncate block">{subitem.label}</span>
											</motion.button>
										))}
									</motion.div>
								)}
							</AnimatePresence>
						</motion.div>
					))}
				</nav>
				
				{/* Logout button at the bottom */}
				<motion.div 
					className="flex-shrink-0 border-t border-slate-200 dark:border-slate-700"
					animate={{ 
						padding: shouldCollapse ? 8 : 16,
					}}
					transition={{ 
						type: "spring", 
						damping: 25, 
						stiffness: 200,
						duration: 0.3
					}}
				>
					<motion.button
						onClick={handleLogout}
						disabled={isLoggingOut}
						className={`w-full flex items-center space-x-3 p-2 md:p-3 rounded-xl transition-all duration-200 text-left ${shouldCollapse ? 'px-2 justify-center' : 'px-3'} text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed`}
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ 
							delay: sidebarItems.length * 0.1 + 0.2,
							duration: 0.3,
							ease: "easeOut"
						}}
					>
						<LogOut className='w-5 h-5 flex-shrink-0' />
						<AnimatePresence>
							{!shouldCollapse && (
								<motion.span 
									className='text-sm font-medium'
									initial={{ opacity: 0, width: 0 }}
									animate={{ opacity: 1, width: "auto" }}
									exit={{ opacity: 0, width: 0 }}
									transition={{ 
										duration: 0.2,
										ease: "easeInOut"
									}}
								>
									{isLoggingOut ? 'Logging out...' : 'Logout'}
								</motion.span>
							)}
						</AnimatePresence>
					</motion.button>
				</motion.div>
			</motion.div>
		</div>
	)
}

export default Sidebar 