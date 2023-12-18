self.addEventListener("push", function (event) {
  const data = event.data.json();
  const options = {
    body: data.body,
    // Include any other notification options you want
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});
