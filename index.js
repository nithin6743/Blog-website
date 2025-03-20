const form = document.querySelector('form');
form.addEventListener('submit', async function (eve) {
  eve.preventDefault();

  const author = document.querySelector('.name').value;
  const title = document.querySelector('.title').value;
  const content = document.querySelector('.content').value;
  const data = { author, title, content };
  const response = await fetch('http://localhost:3000/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  console.log(result);
});
