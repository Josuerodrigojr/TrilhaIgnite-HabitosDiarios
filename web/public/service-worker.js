self.addEventListener('push', function(event){
const body = event.data?.text() ?? '' 

  event.wailUntil(
    self.registration.showNotification('Habits', {
      body,
    })
  )
})