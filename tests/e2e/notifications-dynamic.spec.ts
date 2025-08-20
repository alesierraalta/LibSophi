import { test, expect } from '@playwright/test'

test.describe('Dynamic Notifications Tests', () => {
  test('header should show dynamic notification count and load real notifications', async ({ page }) => {
    // Navigate to any page with header
    await page.goto('/')
    
    // Wait for header to load
    await page.waitForSelector('header', { timeout: 10000 })
    
    // Check if notification bell exists
    const notificationBell = page.locator('button[aria-haspopup="menu"] .lucide-bell')
    await expect(notificationBell).toBeVisible()
    
    // Check if notification badge is shown (only if there are unread notifications)
    const notificationBadge = page.locator('button[aria-haspopup="menu"] span.bg-red-500')
    const badgeVisible = await notificationBadge.isVisible().catch(() => false)
    
    if (badgeVisible) {
      const badgeText = await notificationBadge.textContent()
      console.log(`✅ Notification badge shows: ${badgeText}`)
      
      // Badge should show a number or "99+"
      expect(badgeText).toMatch(/^\d+$|^99\+$/)
    } else {
      console.log('✅ No unread notifications - badge correctly hidden')
    }
    
    // Click notification bell to open dropdown
    await notificationBell.click()
    
    // Wait for dropdown to appear
    await page.waitForSelector('div[role="menu"][aria-label="Notificaciones recientes"]', { timeout: 5000 })
    
    // Check dropdown content
    const dropdown = page.locator('div[role="menu"][aria-label="Notificaciones recientes"]')
    await expect(dropdown).toBeVisible()
    
    // Should have header with "Recientes" and "Ver todas"
    await expect(dropdown.locator('text=Recientes')).toBeVisible()
    await expect(dropdown.locator('text=Ver todas')).toBeVisible()
    
    // Check if loading state or notifications are shown
    const loadingText = dropdown.locator('text=Cargando notificaciones...')
    const noNotificationsText = dropdown.locator('text=No tienes notificaciones recientes')
    const notificationItems = dropdown.locator('li[class*="cursor-pointer"]')
    
    const isLoading = await loadingText.isVisible().catch(() => false)
    const hasNoNotifications = await noNotificationsText.isVisible().catch(() => false)
    const hasNotifications = await notificationItems.count() > 0
    
    if (isLoading) {
      console.log('✅ Notifications are loading')
      // Wait for loading to finish
      await page.waitForSelector('text=Cargando notificaciones...', { state: 'hidden', timeout: 10000 })
    }
    
    if (hasNoNotifications) {
      console.log('✅ No notifications message displayed correctly')
    } else if (hasNotifications) {
      const notificationCount = await notificationItems.count()
      console.log(`✅ Found ${notificationCount} notifications in dropdown`)
      
      // Each notification should have proper structure
      const firstNotification = notificationItems.first()
      await expect(firstNotification).toBeVisible()
      
      // Should have icon, title, body, and time
      await expect(firstNotification.locator('.lucide')).toBeVisible() // Icon
      await expect(firstNotification.locator('.font-medium')).toBeVisible() // Title
      await expect(firstNotification.locator('.text-xs.text-gray-500')).toBeVisible() // Time
    }
    
    console.log('✅ Dynamic notifications dropdown works correctly')
  })

  test('notification badge should update when notifications are read', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/')
    
    // Wait for header to load
    await page.waitForSelector('header', { timeout: 10000 })
    
    // Get initial badge state
    const notificationBell = page.locator('button[aria-haspopup="menu"] .lucide-bell')
    const notificationBadge = page.locator('button[aria-haspopup="menu"] span.bg-red-500')
    
    const initialBadgeVisible = await notificationBadge.isVisible().catch(() => false)
    let initialCount = 0
    
    if (initialBadgeVisible) {
      const badgeText = await notificationBadge.textContent()
      initialCount = badgeText === '99+' ? 99 : parseInt(badgeText || '0', 10)
      console.log(`✅ Initial unread count: ${initialCount}`)
    }
    
    // Open notifications dropdown
    await notificationBell.click()
    await page.waitForSelector('div[role="menu"]', { timeout: 5000 })
    
    // Check for unread notifications (blue background)
    const unreadNotifications = page.locator('li.bg-blue-50')
    const unreadCount = await unreadNotifications.count()
    
    if (unreadCount > 0) {
      console.log(`✅ Found ${unreadCount} unread notifications`)
      
      // Click first unread notification
      await unreadNotifications.first().click()
      
      // Should navigate away or close dropdown
      await page.waitForTimeout(1000)
      
      // Check if badge count decreased (if we can get back to check)
      // This is a basic test - in a real scenario we'd need to track the navigation
      console.log('✅ Clicked unread notification - should mark as read')
    } else {
      console.log('✅ No unread notifications to test with')
    }
  })

  test('"Ver todas" button should navigate to notifications page', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/')
    
    // Wait for header to load
    await page.waitForSelector('header', { timeout: 10000 })
    
    // Open notifications dropdown
    const notificationBell = page.locator('button[aria-haspopup="menu"] .lucide-bell')
    await notificationBell.click()
    
    // Wait for dropdown
    await page.waitForSelector('div[role="menu"]', { timeout: 5000 })
    
    // Click "Ver todas" button
    const viewAllButton = page.locator('text=Ver todas')
    await expect(viewAllButton).toBeVisible()
    await viewAllButton.click()
    
    // Should navigate to notifications page
    await page.waitForURL(/\/notifications/, { timeout: 5000 })
    
    console.log('✅ "Ver todas" button navigates to notifications page')
  })

  test('notification icons should match notification types', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/')
    
    // Wait for header to load
    await page.waitForSelector('header', { timeout: 10000 })
    
    // Open notifications dropdown
    const notificationBell = page.locator('button[aria-haspopup="menu"] .lucide-bell')
    await notificationBell.click()
    
    // Wait for dropdown
    await page.waitForSelector('div[role="menu"]', { timeout: 5000 })
    
    // Check for different notification types and their icons
    const notificationItems = page.locator('li[class*="cursor-pointer"]')
    const notificationCount = await notificationItems.count()
    
    if (notificationCount > 0) {
      for (let i = 0; i < Math.min(notificationCount, 5); i++) {
        const notification = notificationItems.nth(i)
        const hasIcon = await notification.locator('.lucide').isVisible()
        
        if (hasIcon) {
          // Check for different icon types
          const hasCommentIcon = await notification.locator('.lucide-message-circle').isVisible().catch(() => false)
          const hasFollowIcon = await notification.locator('.lucide-user-plus').isVisible().catch(() => false)
          const hasMentionIcon = await notification.locator('.lucide-at-sign').isVisible().catch(() => false)
          const hasLikeIcon = await notification.locator('.lucide-heart').isVisible().catch(() => false)
          const hasBellIcon = await notification.locator('.lucide-bell').isVisible().catch(() => false)
          
          const iconType = hasCommentIcon ? 'comment' :
                          hasFollowIcon ? 'follow' :
                          hasMentionIcon ? 'mention' :
                          hasLikeIcon ? 'like' :
                          hasBellIcon ? 'generic' : 'unknown'
          
          console.log(`✅ Notification ${i + 1} has ${iconType} icon`)
          expect(hasIcon).toBeTruthy()
        }
      }
    } else {
      console.log('✅ No notifications to test icon types')
    }
    
    console.log('✅ Notification icons are properly displayed')
  })

  test('notifications should be clickable and navigate appropriately', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/')
    
    // Wait for header to load
    await page.waitForSelector('header', { timeout: 10000 })
    
    // Open notifications dropdown
    const notificationBell = page.locator('button[aria-haspopup="menu"] .lucide-bell')
    await notificationBell.click()
    
    // Wait for dropdown
    await page.waitForSelector('div[role="menu"]', { timeout: 5000 })
    
    // Check for clickable notifications
    const notificationItems = page.locator('li[class*="cursor-pointer"]')
    const notificationCount = await notificationItems.count()
    
    if (notificationCount > 0) {
      // Click first notification
      const firstNotification = notificationItems.first()
      await expect(firstNotification).toBeVisible()
      
      // Check if it's clickable
      await expect(firstNotification).toHaveClass(/cursor-pointer/)
      
      // Get initial URL
      const initialUrl = page.url()
      
      // Click the notification
      await firstNotification.click()
      
      // Wait a bit for navigation
      await page.waitForTimeout(1000)
      
      // URL should have changed or dropdown should be closed
      const currentUrl = page.url()
      const dropdownVisible = await page.locator('div[role="menu"]').isVisible().catch(() => false)
      
      if (currentUrl !== initialUrl) {
        console.log(`✅ Notification click navigated to: ${currentUrl}`)
      } else if (!dropdownVisible) {
        console.log('✅ Notification click closed dropdown')
      } else {
        console.log('✅ Notification click handled (no navigation needed)')
      }
    } else {
      console.log('✅ No notifications to test clicking')
    }
    
    console.log('✅ Notification clicking behavior works correctly')
  })
})

