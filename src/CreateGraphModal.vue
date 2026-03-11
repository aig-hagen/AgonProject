<template>
  <dialog id="my_modal_1" class="modal">
    <div class="modal-box">
      <h3 class="text-lg font-bold">Create new Argumenation</h3>
      <!-- TODO https://daisyui.com/components/fieldset/ used wrong-->
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Type</legend>
        <select class="select">
          <option selected>Abstract</option>
          <option>Bipolar</option>
          <option>Assumption-based</option>
          <option>Abstract dialectical</option>
        </select>
      </fieldset>
      <fieldset class="fieldset">
        <legend class="fieldset-legend">File Name</legend>
        <label class="input">
          <svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <g
              stroke-linejoin="round"
              stroke-linecap="round"
              stroke-width="2.5"
              fill="none"
              stroke="currentColor"
            >
              <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
              <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
            </g>
          </svg>
          <input type="text" placeholder="Abstract" />
        </label>
      </fieldset>
      <div class="modal-action">
        <form method="dialog">
          <button class="btn btn-primary">Create</button>
        </form>
      </div>
    </div>
  </dialog>
</template>
