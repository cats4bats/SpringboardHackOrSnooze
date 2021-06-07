"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  if(currentUser){
    if (currentUser.isFavorite(story)){
      return $(`
        <li id="${story.storyId}">
          <input type="checkbox" class="checkbox" checked>
          <a href="${story.url}" target="a_blank" class="story-link">
            ${story.title}
          </a>
          <small class="story-hostname">(${hostName})</small>
          <small class="story-author">by ${story.author}</small>
          <small class="story-user">posted by ${story.username}</small>
          <button class="delete">delete</button>
        </li>
      `);
    }
  }
  
  return $(`
      <li id="${story.storyId}">
        <input type="checkbox" class="checkbox">
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
        <button class="delete">delete</button>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

//Write a function in stories.js that is called when users submit the form. Pick a good name for it. This function should get the data from the form, call the .addStory method you wrote, and then put that new story on the page.

async function userSubmitStoryForm(){
  //get form values
  let title = $storyName.val();
  let author = $storyAuthor.val();
  let url = $storyUrl.val();

  const story = await storyList.addStory(currentUser, {title, author, url});
  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);
  putStoriesOnPage();
  $storyForm.hide();
}

$storyForm.submit(userSubmitStoryForm);


$('#all-stories-list').on("change", ".checkbox",async function(evt) {
  console.debug('checked');
  const $tgt = $(evt.target);
  const $closestLi = $tgt.closest("li");
  const storyId = $closestLi.attr("id");
  const story = storyList.stories.find(s => s.storyId === storyId);
  if(this.checked) {
    await currentUser.addFavorite(story);
  }else{
    await currentUser.removeFavorite(story);
  }
});

$('#all-stories-list').on("click", ".delete",async function(evt) {
  console.debug('delete');
  const $tgt = $(evt.target);
  const $closestLi = $tgt.closest("li");
  const storyId = $closestLi.attr("id");
  await currentUser.removeStory(storyId);
  $closestLi.remove();
});
