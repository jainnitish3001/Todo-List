//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/todoListDB",{useNewUrlParser:true,useUnifiedTopology: true});

const itemSchema={
  name:String
};
const Item=mongoose.model("Item",itemSchema)

const item1=new Item({name:"Welcome to your TODO list"});

const item2=new Item({name:"Hit + button to add a new line"});

const item3=new Item({name:"<-- Hit this to delete an item"});

const defaultitems=[item1,item2,item3];

const listSchema={
  name:String,
  item:[itemSchema]
};

const List=mongoose.model("List",listSchema);


app.get("/", function(req, res){
  var today=new Date();
  var currentDay=today.getDay();
  var options={
    weekday:"long",
    day:"numeric",
    month:"long"
  }
  var day=today.toLocaleDateString("en-US",options);
  Item.find({},function(err,foundItems){
    if(foundItems.length===0)
    {
      Item.insertMany(defaultitems,function(err)
      {
        if(err){
          console.log(err);
        }
        else
        {
          console.log("Success");
        }
      });
      res.redirect("/");
    }
    else
    {
    res.render("list",{listTitle:day,newListItems:foundItems});
    }
  });
});

app.get("/:customListName",function(req,res){
  const customListName=(req.params.customListName);
  List.findOne({name:customListName},function(err,foundList){
    if(!err)
    {
      if(!foundList)
      {
        const list=new List({
          name:customListName,
          items:defaultitems
        });
        list.save();
        res.redirect("/"+customListName);
      }
      else{
          res.render("list",{listTitle:foundList.name,newListItems:foundList.items});
      }
    }
  });

});

app.post("/",function(req,res){
  const itemName=req.body.newItem;
  const item=new Item({
    name:itemName
  });
  item.save();
  res.redirect("/");
});

app.post("/delete",function(req,res){
  const checkedItemId=(req.body.checkbox);
  Item.findByIdAndRemove(checkedItemId,function(err){
    if(!err){
      console.log("Successfully deleted");
      res.redirect("/");
    }
  })
})

app.listen(3000, function(){

});
