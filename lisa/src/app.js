define( [ "./stack", "./card", "./button", "./abstractwidget", "./textfield", "./model" ], function( Stack, Card, Button, AbstractWidget, TextField, Model ) {
    
    return AbstractWidget.extend({
        init: function() {
            var stack = new Stack({ parent: "body"  });

            var model = window.model = new Model({
                data: {
                    value1: "oh yeh!"
                }
            });

            stack.push(new Card({
                title: "Field Test",
                children: [
                    new TextField({ id: "test", model: model, modelField: "value1" }),
                    new Button({ id: "button", label: "Validate" })
                ]
            }));
        }
    });
});