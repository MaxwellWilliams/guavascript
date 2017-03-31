railroad_insert = ((code, title) => {
	return `<div class="one-third examples">
    <div class="container example vertical-center">
      <div class="row horizontal-center">
        <div class="col-xs-12 text-center">
          <div class="syntaxdiagrams">
            <h5 class="text-center">${title}</h5><script>${code}</script>
          </div>
        </div>
      </div>
    </div>
  </div>`
});