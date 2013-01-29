define(['textfield'], function(TextField) {
  describe('TextField Widget', function(){
    it('should set the initial value', function() {
      var txt = new TextField({value: "abc"});

      expect(txt.val()).toEqual("abc");
    });
  });
});