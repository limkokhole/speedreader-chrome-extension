var SpeedReader = {
  currentWord : 0,
  words : [],
  myTimer : null,
  wpm : 100,
  paused : true,


  // Each word has a red letter towards the center of the
  // word.  This method finds and highlights that letter.
  highlightWord : function(word) {
    var center = Math.floor(word.length / 2);
    var letters = word.split('');
    var result = [];
    return letters.map(function(letter, idx){
      if (idx === center){
        return '<span id="speedReaderHighlight">' + letter + '</span>';
      }
      return letter;
    }).join('');
  },


  // Each word's red letter must be in the same horizontal
  // position, which is achieved by pushing the word left
  // or right.  This method does the pushing.
  positionWord : function(){
    wordEl = $("#speedReaderWord")[0];
    highlight = $("#speedReaderHighlight")[0];
    readerEl = $('#speedReaderBox')[0];

    var centerOffsetX = (highlight.offsetWidth / 2) + highlight.offsetLeft;
    var centerOffsetY = (highlight.offsetHeight / 2) + highlight.offsetTop;

    wordEl.style.left = ((readerEl.clientWidth / 2) - centerOffsetX) + 'px';
    wordEl.style.top = ((readerEl.clientHeight / 2) - centerOffsetY) + 'px';
  },

  // Each time the Speed Reader icon is clicked,
  // this methid is called.
  displayWords : function(selected_text){
    $("#speedReaderControl").html("Start");
    $("#speedReaderWord").html("");
    this.paused = true;
    that = this;
    currentWord = 0;
    chrome.storage.sync.get("wpm", function(result){
      that.wpm = ('wpm' in result) ? result.wpm : 250;
      $("#speedReaderWpm").html(that.wpm);
      words = selected_text.split(/\s+/).map(that.highlightWord);
      that.updateTimeRemaining();
      that.displayNextWord();
    });
  },

  // Displays the next word and sets
  // the timer for prep for the following word.
  displayNextWord : function(){
    if (this.paused) {return;}
    if (currentWord < words.length) {
      word = words[currentWord++];
    }
    this.updateTimeRemaining();
    var hasPause = /^\(|[,\.\)]$/.test(word);
    $("#speedReaderWord").html(word);
    this.positionWord();

    if (currentWord < words.length)
    {
      var delay = 60000 / this.wpm;
      that = this;
      myTimer = setTimeout(function() { that.displayNextWord(); }, delay * (hasPause ? 2 : 1));
    }
  },

  updateTimeRemaining : function(){
    var words_left = words.length - currentWord;
    var minutes_left = Math.floor(words_left / this.wpm);
    var seconds_left = Math.round(60 * ((words_left - (minutes_left * this.wpm)) / this.wpm));
    if(seconds_left < 10){ seconds_left = "0" + seconds_left; }
    $("#speedReaderTimeRemaining").html(minutes_left + ":" + seconds_left + " remaining");
  },

  changeSpeed : function(change){
    this.wpm = this.wpm + change;
    if(this.wpm < 0) {this.wpm = 0;}
    chrome.storage.sync.set({'wpm': this.wpm});
    this.updateTimeRemaining();
    return this.wpm;
  },

  pause  : function(){ this.paused = true; },
  resume : function(){ this.paused = false; this.displayNextWord(); }

};
