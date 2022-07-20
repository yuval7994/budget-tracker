let db
const request = indexedDB.open("budget", 1)

request.onupgradeneeded = function (event) {
  db = event.target.result
  db.createObjectStore("pendingTransac", { autoIncrement: true })
}

request.onsuccess = function (event) {
  db = event.target.result
  if (window.navigator.onLine) {
    console.log("window online now ")
    checkIndexdb()
  }
}

request.onerror = function (event) {
  console.log(event.target.error)
}

function saveRecord(record) {
  const transaction = db.transaction("pendingTransac", "readwrite")
  const store = transaction.objectStore("pendingTransac")
  store.add(record)
}

function checkIndexdb() {
  const transaction = db.transaction("pendingTransac", "readwrite")
  const store = transaction.objectStore("pendingTransac")
  const getAll = store.getAll()

  console.log(getAll)

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then(() => {
          const transaction = db.transaction(["pendingTransac"], "readwrite")

          const store = transaction.objectStore("pendingTransac")

          store.clear()
        })
    }
  }
}

window.addEventListener("online", checkIndexdb)
