const addTagButton = document.getElementById('add_tag');
const tagInput = document.getElementById('tag_name_input');
const tagsList = document.getElementById('tags_list');

//3 default questions
const dq1 = document.getElementById('dq1_name_input');
const dq2 = document.getElementById('dq2_name_input');
const dq3 = document.getElementById('dq3_name_input');

// logic for adding a tag
addTagButton.addEventListener('click',(e) => {
  e.preventDefault()
  const currentValue = tagInput.value

  if (currentValue !== ''){
    const li = document.createElement('li');
    li.textContent = currentValue;
    li.addEventListener('click', (e) => { li.remove() });
    tagsList.appendChild(li)
  }

  tagInput.value = '';
});

const createQAFormButton = document.getElementById('create_qa');
const topicNameInput = document.getElementById('topic_name_input');
const message = document.querySelector('.message');

//Failed restore button
/*
const restorePizzaButton = document.getElementById('restore_pizza');

restorePizzaButton.addEventListener('click',(e) => {
  e.preventDefault()
  let tags =  [ "Yum!!", "Yuck...", "Don't know/Don't care" ];
  let data = {    
    topic_name: "Pineapple on Pizza",
    tags,
    dfq1: "Do you actually like it, or is it just a meme?",
    dfq2: "What makes a good pizza, in your opinion?",
    dfq3: "Have you even tried it?"       
  };

  const method = 'POST';
  let body = JSON.stringify(data);
  let headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };

  fetch('/typeform/forms', { method, body, headers })
    .then((res) => res.json())
    .then((msg) => {
      message.innerHTML = `Form sucessfully restored, check it live <a href='${ msg.form_link }'>here</a>.`

      // reset values
      tagInput.value = '';
      topicNameInput.value = '';
    });
  
});

*/
                                    
// get topic and tags and send POST to create a new form
createQAFormButton.addEventListener('click',(e) => {
  e.preventDefault()
  
  if (topicNameInput.value === '') {
    alert('Please add a name for the topic');
    return;
  }

  let tags = [];
  const tagsFromDOM = [ ...document.querySelectorAll('#tags_list li') ];

  tagsFromDOM.map((li) => {
    tags.push(li.textContent);
  });

  if (tags.length !== 3) {
    alert('Please add 3 tags');
    return;
  }
  
  let data = {
    topic_name: topicNameInput.value,
    tags,
    dfq1: dq1.value,
    dfq2: dq2.value,
    dfq3: dq3.value   
    
  };

  const method = 'POST';
  let body = JSON.stringify(data);
  let headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };

  fetch('/typeform/forms', { method, body, headers })
    .then((res) => res.json())
    .then((msg) => {
      message.innerHTML = `Form sucessfully created, check it live <a href='${ msg.form_link }'>here</a>.`

      // reset values
      tagInput.value = '';
      topicNameInput.value = '';
    });
});
