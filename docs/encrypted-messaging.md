# Future: Encrypted Messaging

## Client Side PIN

The following script is a prospect to allowing the user to input their PIN to decrypt their messages, as well as for Texts to gain access to the payload needed to encrypt/decrypt.

After the user is logged in and the page is populated, the `MutationObserver` will check to see if there is a `[autocomplete='one-time-password']` element present on the page. If so, it is assumed that the user is being prompted for their encryption PIN. If not, the window is closed and the authentication flow is considered complete.

If the user was prompted for their PIN, `XMLHttpRequest#open` and `XMLHttpRequest#send` are stubbed to detect and extract the payload for encryption & decryption. Once the response is resolved, the authentication flow is considered complete.

```js
let awaitingMessengerEncryptionPin = false;

new MutationObserver((list, observer) => {
  if (!require("CurrentUserInitialData")?.USER_ID) return;

  for (const mutation of list) {
    const addedNodes = Array.from(mutation.addedNodes);

    if (mutation.type !== "childList" || !addedNodes.length) continue;

    observer.disconnect();

    for (const node of addedNodes) {
      if (node.nodeType !== Node.ELEMENT_NODE) continue;
      const field = node.querySelector("[autocomplete='one-time-code']");

      if (field) return awaitMessengerEncryptionPin();
      else if (!awaitingMessengerEncryptionPin) return closeWindow();
    }
  }
}).observe(document.body, { subtree: true, childList: true });

function awaitMessengerEncryptionPin() {
  awaitingMessengerEncryptionPin = true;

  const open = XMLHttpRequest.prototype.open;
  const send = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (_, url) {
    this._url = url;
    return open.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function (data) {
    if (this._url === "/api/graphql/") {
      const encodedBody = Object.fromEntries(new URLSearchParams(data));
      if (
        encodedBody["fb_api_req_friendly_name"] ===
        "VestaServerGraphQLLoginProviderFinishLoginMutation"
      ) {
        const originalOnReadyStateChange = this.onreadystatechange;

        this.onreadystatechange = () => {
          originalOnReadyStateChange.call(this);
          setTimeout(() => {
            if (this.readyState !== 4 || this.status !== 200) return;
            closeWindow();
          }, 0);
        };
      }
    }

    return send.apply(this, arguments);
  };
}

function closeWindow() {
  window.close();
}
```
