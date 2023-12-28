<script lang="ts">
	import { site } from '$lib/site'
	import {
		CloseButton,
		DarkMode,
		Drawer,
		NavBrand,
		NavHamburger,
		NavLi,
		NavUl,
		Navbar,
		Sidebar,
		SidebarDropdownWrapper,
		SidebarGroup,
		SidebarItem,
		SidebarWrapper
	} from 'flowbite-svelte'
	import {
		CalendarMonthSolid,
		ChartPieSolid,
		CheckSolid,
		ClockSolid,
		CloseCircleSolid,
		CloseSolid,
		DollarSolid,
		FileSolid,
		GlobeSolid,
		TrashBinSolid,
		UserSolid
	} from 'flowbite-svelte-icons'
	import { onMount } from 'svelte'
	import type { LayoutData } from './$types'

	export let data: LayoutData

	$: activeUrl = data.activeUrl

	let breakPoint: number = 1024
	let width: number
	let backdrop: boolean = false
	let activateClickOutside = true
	let drawerHidden: boolean = false

	$: if (width >= breakPoint) {
		drawerHidden = false
		activateClickOutside = false
	} else {
		drawerHidden = true
		activateClickOutside = true
	}
	onMount(() => {
		if (width >= breakPoint) {
			drawerHidden = false
			activateClickOutside = false
		} else {
			drawerHidden = true
			activateClickOutside = true
		}
	})
	const toggleSide = () => {
		if (width < breakPoint) drawerHidden = !drawerHidden
	}

	// let spanClass = 'flex-1 ms-3 whitespace-nowrap'

	let divClass = 'w-full ml-auto lg:block lg:w-auto order-1 lg:order-none'
	let ulClass =
		'flex flex-col py-3 my-4 lg:flex-row lg:my-0 text-sm font-medium gap-4 dark:lg:bg-transparent lg:bg-white lg:border-0'
</script>

<svelte:window bind:innerWidth={width} />
<div class="relative min-h-screen">
	<Navbar
		let:toggle
		class="fixed start-0 top-0 z-20 w-full border-b bg-white px-2 py-2.5 sm:px-4 dark:bg-slate-950"
	>
		<NavHamburger on:click={() => (drawerHidden = false)} btnClass=" lg:hidden" />
		<NavBrand href="#" class="ml-4 md:ml-0">
			<img src={site.img} class="me-3 h-6 sm:h-9" alt={site.imgAlt} />
			<span class="self-center whitespace-nowrap pl-4 text-xl font-semibold dark:text-white">
				{site.name}
			</span>
		</NavBrand>
		<div class="flex items-center">
			<NavUl>
				<!-- <NavLi class="lg:mb-0 lg:px-2" href="https://github.com/ikhsan3adi">GitHub</NavLi> -->
				<NavLi class="hover:underline lg:mb-0 lg:px-2" href={data?.links.openApi}>
					OpenAPI Docs
				</NavLi>
			</NavUl>
			<DarkMode class="inline-block hover:text-gray-900 dark:hover:text-white" />
		</div>
		<NavHamburger on:click={toggle} btnClass="lg:hidden" />
	</Navbar>

	<Drawer
		transitionType="fly"
		{backdrop}
		bind:hidden={drawerHidden}
		bind:activateClickOutside
		class="z-0 border-r pb-16 pt-20"
		width="100"
		id="sidebar"
	>
		<div class="flex items-center">
			<CloseButton on:click={() => (drawerHidden = true)} class="mb-4 lg:hidden dark:text-white" />
		</div>
		<Sidebar {activeUrl}>
			<SidebarWrapper divClass="py-4 px-3 rounded dark:bg-gray-800">
				<SidebarGroup>
					<SidebarItem
						label="Dashboard"
						href={activeUrl === '/admin/dashboard' ? null : '/admin/dashboard'}
						on:click={toggleSide}
						active={activeUrl === '/admin/dashboard'}
					>
						<svelte:fragment slot="icon">
							<ChartPieSolid
								class="h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
							/>
						</svelte:fragment>
					</SidebarItem>
					<SidebarDropdownWrapper isOpen={activeUrl === '/admin/event'} label="Event management">
						<svelte:fragment slot="icon">
							<CalendarMonthSolid
								class="h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
							/>
						</svelte:fragment>
						<SidebarItem label="Draft" href={'/admin/event?status=DRAFT'} on:click={toggleSide}>
							<svelte:fragment slot="icon">
								<FileSolid
									class="ml-3 h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
								/>
							</svelte:fragment>
						</SidebarItem>
						<SidebarItem
							label="Published"
							href={'/admin/event?status=PUBLISHED'}
							on:click={toggleSide}
						>
							<svelte:fragment slot="icon">
								<GlobeSolid
									class="ml-3 h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
								/>
							</svelte:fragment>
						</SidebarItem>
						<SidebarItem
							label="Cancelled"
							href={'/admin/event?status=CANCELLED'}
							on:click={toggleSide}
						>
							<svelte:fragment slot="icon">
								<CloseSolid
									class="ml-3 h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
								/>
							</svelte:fragment>
						</SidebarItem>
						<SidebarItem
							label="Rejected"
							href={'/admin/event?status=REJECTED'}
							on:click={toggleSide}
						>
							<svelte:fragment slot="icon">
								<CloseCircleSolid
									class="ml-3 h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
								/>
							</svelte:fragment>
						</SidebarItem>
						<SidebarItem label="Deleted" href={'/admin/event?deleted=true'} on:click={toggleSide}>
							<svelte:fragment slot="icon">
								<TrashBinSolid
									class="ml-3 h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
								/>
							</svelte:fragment>
						</SidebarItem>
					</SidebarDropdownWrapper>
					<SidebarDropdownWrapper
						isOpen={activeUrl === '/admin/withdraw'}
						label="Withdraw Requests"
					>
						<svelte:fragment slot="icon">
							<DollarSolid
								class="h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
							/>
						</svelte:fragment>
						<SidebarItem
							label="Pending"
							href={'/admin/withdraw?status=PENDING'}
							on:click={toggleSide}
						>
							<svelte:fragment slot="icon">
								<ClockSolid
									class="ml-3 h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
								/>
							</svelte:fragment>
						</SidebarItem>
						<SidebarItem
							label="Completed"
							href={'/admin/withdraw?status=COMPLETED'}
							on:click={toggleSide}
						>
							<svelte:fragment slot="icon">
								<CheckSolid
									class="ml-3 h-5 w-5  text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
								/>
							</svelte:fragment>
						</SidebarItem>
						<SidebarItem
							label="Rejected"
							href={'/admin/withdraw?status=REJECTED'}
							on:click={toggleSide}
						>
							<svelte:fragment slot="icon">
								<CloseCircleSolid
									class="ml-3 h-5 w-5  text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
								/>
							</svelte:fragment>
						</SidebarItem>
					</SidebarDropdownWrapper>
					<SidebarItem
						label="Admin Management"
						href={activeUrl === '/admin/user' ? null : '/admin/user'}
						on:click={toggleSide}
						active={activeUrl === '/admin/user'}
					>
						<svelte:fragment slot="icon">
							<UserSolid
								class="h-5 w-5  text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
							/>
						</svelte:fragment>
					</SidebarItem>
				</SidebarGroup>
			</SidebarWrapper>
		</Sidebar>
	</Drawer>

	<div class="mx-auto flex w-full pl-1 pt-20">
		<main class="mx-auto w-full lg:ml-72">
			<slot />
		</main>
	</div>
</div>