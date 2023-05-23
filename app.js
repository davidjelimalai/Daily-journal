//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect('mongodb+srv://davidjelimalai:David_069300769@cluster0.dzpvhkc.mongodb.net/todolistDB');
  
const itemsSchema= new mongoose.Schema({
  name:String
});
const Item=mongoose.model("Item",  itemsSchema);

const item0= new Item({
  name:"Welcome to your todolist!"
})

const item1= new Item({
  name:"Hit the + button to add a new item"
})
const item2= new Item({
  name:"<-- Hit this to delete an item>"
})


const defaultItems=[item0, item1, item2]

const ListSchema=new mongoose.Schema({
  name:String,
  items:[itemsSchema]
})

const List=mongoose.model("List", ListSchema)


app.get("/", function(req, res) {

  Item.find({})
    .then((foundItems) => {

      if(foundItems.length===0){
Item.insertMany(defaultItems)
  .then(() => {
    console.log("Succes insert items");
  }).catch((err) => {
    console.log("Error inserted method");
  });

  res.redirect("/");
      }else{
        res.render("list", {listTitle: "Today", newListItems: foundItems});
      }

  }).catch((err) => {
    console.log("Error finded");
  });

});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list

const item=new Item({
name:itemName
});

if(listName==="Today"){
  item.save();
  res.redirect("/");

}else{
  List.findOne({name:listName})
  .then(function(foundList){
foundList.items.push(item)
foundList.save();
res.redirect("/" + listName)
  })
  .catch(function(err){
    console.log(err);
  })
}

});

app.get("/:customListName", function(req,res){
const customListName=req.params.customListName.toLocaleUpperCase();


List.findOne({name:customListName})
.then((foundList) => {
  if(!foundList){

    const list=new List({
      name:customListName,
      items:defaultItems
    })
  
   list.save();
   res.redirect("/" + customListName);

  }else{
   res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
  }
  })
  .catch((err) => {
   console.log(err);
  
  });
 
});


app.post("/delete", function(req,res){

  const selectBox=req.body.checkbox
  const listName=req.body.listName

  if(listName==="Today"){
    Item.findByIdAndDelete({_id:selectBox})
    .then(() => {
      console.log("Successfully Deleted");
      res.redirect("/");
    });

  }else{

List.findOneAndUpdate({name:listName}, {$pull:{items:{_id:selectBox}}})
.then(function(err, foundList){
if(!err){
  console.log("Successfully deleted checked item.");
}
res.redirect("/" + listName)
})
.catch(function(err){
  console.log(err);
});
  
}
});




app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
