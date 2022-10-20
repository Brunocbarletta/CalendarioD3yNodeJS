var weekday;
function WeekdayValor() {
  weekday = document.getElementById("select").value;
  console.log(weekday);
  d3.select("svg").remove();
  GraficaTodo();
}

var csv;
var Json=[];
var Datos=[];
var years;
var cellSize=17;
var width =954;
var height;
var countDay;
var formatDay;
var Async=false;

 

///Parseo CSV//
$.ajax({
  url: "../../archivo.csv",
  dataType: "text",
  contentType: "charset=utf-8",
}).done(ConvierteDatos);

function ConvierteDatos(data) {
  csv = $.csv.toArrays(data);
  
  for(i=1;i<=csv.length-2;i++) {
    Json.push({
      "date":""+csv[i][0]+"",
      "close":""+csv[i][4]+"",
      "value":""+(csv[i+1][4]-csv[i][4])/csv[i][4]+""
    });
  } 

  console.log("ArrayCsv");
  ArrayAños();
};
////////Fin del parseo CSV//////

//////years//////////
 function ArrayAños() {
  years = d3.groups(Json, d => new Date(d.date).getFullYear()).reverse();
  GraficaTodo();
 };
///////Fin Years////


function GraficaTodo() {
////////////Time Week////////////"Semana del tiempo"
timeWeek = weekday === "sunday" ? d3.utcSunday : d3.utcMonday;
/////////count day////////////
countDay = weekday === "sunday" ? i => i : i => (i + 6) % 7; 
///////////////////
height = cellSize * ( weekday === "weekday" ? 7 : 9);

//////////////Path month/////////////
function pathMonth(t) {
   //UTCday devuelve el numero de semana segun el numero de la fecha en ese mes.
  const n = weekday === "weekday" ? 5 : 7;
  const d = Math.max(0, Math.min(n, countDay(t.getUTCDay())));
  const w = timeWeek.count(d3.utcYear(t), t);
  return `${d === 0 ? `M${w * cellSize},0`
      : d === n ? `M${(w + 1) * cellSize},0`
      : `M${(w + 1) * cellSize},0V${d * cellSize}H${w * cellSize}`}V${n * cellSize}`;
}
////////////Fin path month////////////////


////////formateos//////
formatValue = d3.format("+.2%");
formatClose = d3.format("$,.2f");
formatDate = d3.utcFormat("%x");
formatDay = i => "SMTWTFS"[i];
formatMonth = d3.utcFormat("%b");
////////FIN formateos//////


//////Construccion de chart////////////////

var svg = d3.select("body").append("svg")
        .attr("viewBox", [0, 0, width, height * years.length])
        .attr("font-family", "sans-serif")
        .attr("font-size", 10); //ver el viewbox en el calendar, pero es donde se va a visualizar el calendario...
        year = svg.selectAll("g")
        .data(years)
        .join("g")
          .attr("transform", (d, i) => `translate(40.5,${height * i + cellSize * 1.5})`);

        year.append("text")
          .attr("x", -5)
          .attr("y", -5)
          .attr("font-weight", "bold")
          .attr("text-anchor", "end")
          .text(([key]) => key);


          year.append("g")//contenedor de texto que indica el dia L M M J V S D
      .attr("text-anchor", "end")
    .selectAll("text")
    .data(weekday === "weekday" ? d3.range(1, 6) : d3.range(7)) //devuelve un array desde pos 1 a la 6 o devuelve un array de 7 posiciones (contando el 0)
    .join("text") //texto que tendra primera letra de cada dia.
      .attr("x", -5)
      .attr("y", i => (countDay(i) + 0.5) * cellSize)
      .attr("dy", "0.31em")
      .text(formatDay);

      //declaro coloreando.
    color= Coloreando(); //color es una funcion no un valor.

      year.append("g")//este contenedor tiene todos los dias del año.
      .selectAll("rect")//cada cuadradito por dia es un rect.
      .data(weekday === "weekday"
          ? ([, values]) => values.filter(d => ![0, 6].includes(new Date(d.date).getUTCDay()))//agregue aca tambien
          : ([, values]) => values)
      .join("rect")
        .attr("width", cellSize - 1)
        .attr("height", cellSize - 1)
        .attr("x", d => timeWeek.count(d3.utcYear(new Date(d.date)), new Date(d.date)) * cellSize + 0.5)//count agrega 1 a la variable que le mandas.
        .attr("y", d => countDay(new Date(d.date).getUTCDay()) * cellSize + 0.5)
        .attr("fill", d => color(d.value))// usa el valor que le mandas por mas que aparentemente no reciba nada.
      .append("title")
        .text(d => `${formatDate(new Date(d.date))}
  ${formatValue(d.value)}
  ${d.close === undefined ? "asd" : `${formatClose(d.close)}`}`);

  const month = year.append("g")
  .selectAll("g")
  .data(([, values]) => d3.utcMonths(d3.utcMonth(new Date(values[0].date)), new Date(values[values.length - 1].date))) 
  .join("g");//agregue aca 2  new Date  adenetro del segundo utcmonth 

  month.filter((d, i) => i).append("path")
      .attr("fill", "none")
      .attr("stroke", "#fff")
      .attr("stroke-width", 3)
      .attr("d", pathMonth);
      
    month.append("text")
      .attr("x", d => timeWeek.count(d3.utcYear(new Date(d)),timeWeek.ceil(d)) * cellSize + 2)
      .attr("y", -5)
      .text(formatMonth);


      console.log("chartSVG");    

  return svg.node();
///////////////////Fin de construcion de chart////////////////////


}

//coloreando devuelve una cadena "rgb(150,45,36)" por poner un ejemplo, segun valor que se le mande.
function Coloreando() { 
  const max = d3.quantile(Json.map(d => Math.abs(d.value)).sort(d3.ascending), 0.9975);
  return d3.scaleSequential(d3.interpolatePiYG).domain([-max, +max]); //esta linea devuelve el color segun el dominio y la escala recibida.
}
     

  


