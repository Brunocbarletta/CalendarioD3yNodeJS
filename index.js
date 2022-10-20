const express= require('express');
const app=express();

app.set('view engine','ejs');

app.set('views',__dirname+'/views');
app.use(express.static('views')); 
app.use(express.static('public'));

app.get('/',(req, res) => {
    res.render("1.ejs");  
});


app.get('/2',(req, res) => {
    res.render("2.ejs");  
});

 
 app.listen(3000,()=>{
    console.log('servidor funcionando')
    console.log(''+__dirname+'');
});
