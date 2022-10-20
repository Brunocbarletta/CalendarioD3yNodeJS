var weekday;
var Json=[];
var Meses;
var Dias;
var LlamadosXDia=[];
var cellSize=17;
var width =954;
var height;
var years;


///Levanto y parseo a array//
$.ajax({
  url: "../../llamados2019.csv",
  dataType: "text",
  contentType: "charset=utf-8",
}).done(ConvierteDatos);

function ConvierteDatos(data) {
  var csv= $.csv.toArrays(data);
  ////creo nuevo csv a partir del recibido con solo fecha y numero de llamado///
  
  for(i=1;i<=csv.length-1;i++) {
    Json.push({
      "fecha": new Date((csv[i][13])),
      "NroLlamado":""+i+""
    });
  } 

  console.log("ArrayCsv");
    ArrayAños();
    ArrayDias();
    DiasPosta();
};
/////////////////////////Fin del parseo CSV//////////////////


//////years//////////
function ArrayAños(){
  console.log("pta madre anda por favor te lo pido...")
  years= d3.groups(Json, d => d.fecha.getFullYear()).reverse();
 };
//////////////Fin Years////


//////Agrupacion por mes//////////
function ArrayMeses(){
  console.log("Agrupo Meses")
  Meses= d3.groups(Json, d => (d.fecha).getMonth());
  GraficaTodo();
 };
//////////////Fin Agrupacion por mes////

//////Agrupacion por dia//////////
function ArrayDias() {
  console.log("Agrupo Dias")
  Dias = d3.groups(Json, d => (d.fecha).getMonth(), d =>(d.fecha).getDate());
 };
//////////////Fin Agrupacion por dia////


function GraficaTodo() {

////////////Time Week////////////"Semana del tiempo"
timeWeek = weekday === "sunday" ? d3.utcSunday : d3.utcMonday; 
//es sunday? "si" entoonces utc sunday, ¿no? entonces utcMonday.

/////////count day////////////
countDay = weekday === "sunday" ? i => i : i => (i + 6) % 7; 
///////////////////
height = cellSize * ( weekday === "weekday" ? 7 : 9);
////////////////////////////////////////////////////

////////formateos//////
formatValue = d3.format("+.2%");
formatDate = d3.utcFormat("%x");
formatDay = i => "DLMMJVS"[i];
formatMonth = d3.utcFormat("%b");
////////FIN formateos//////

//////////////GRAFICANDO////////////////////
var svg = d3.select("body").append("svg")
        .attr("viewBox", [0, 0, width, height * Json2.length]) 
        .attr("font-family", "sans-serif")
        .attr("font-size", 10);

        year = svg.selectAll("g")
        .data(Json2)
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
          
        color= Coloreando();
          
          year.append("g")//este contenedor tiene todos los dias del año.
          .selectAll("rect")//cada cuadradito por dia es un rect.
          .data(Json2[0][1])
          .join("rect")
            .attr("width", cellSize - 1)
            .attr("height", cellSize - 1)
            .attr("x", d => timeWeek.count(d3.utcYear((d.fecha)), (d.fecha)) * cellSize + 0.5)//count agrega 1 a la variable que le mandas.
            .attr("y", d => countDay((d.fecha).getDay()) * cellSize + 0.5)
            .attr("fill", d => color(d.CantLlamados))// usa el valor que le mandas por mas que aparentemente no reciba nada.
          .append("title")
            .text( d => `${formatDate((d.fecha))} Llamados: ${d.CantLlamados}`);


      const month = year.append("g")
      .selectAll("g")
      .data(([, values]) => d3.utcMonths(d3.utcMonth((values[0].fecha)), (values[values.length - 1].fecha))) 
      .join("g");

      month.filter((d, i) => i).append("path")
      .attr("fill", "none")
      .attr("stroke", "#fff")
      .attr("stroke-width", 3)
      .attr("d", pathMonth);
      
    month.append("text")
      .attr("x", d => timeWeek.count(d3.utcYear((d)),timeWeek.ceil(d)) * cellSize + 2)
      .attr("y", -5)
      .text(formatMonth);

      return svg.node();
}

///////////////////////////////////////////funciones//////////////////////////////////////////////////////
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

function Coloreando() { 
   const max = d3.quantile(LlamadosXDia.map(d => Math.abs(d.CantLlamados)).sort(d3.ascending),0.999999999);
   return d3.scaleSequential(d3.interpolatePiYG).domain([+max,-max]); //esta linea devuelve el color segun el dominio y la escala recibida.
}


function DiasPosta() {
  for(i=0;i<Dias.length;i++) {
    for(k=0;k<Dias[i][1].length;k++) {
        var f = f++;
        LlamadosXDia.push({
            fecha: Dias[i][1][k][1][1].fecha,
            CantLlamados: ""+Dias[i][1][k][1].length+"",
        });
      }
  } 

  Json2 = d3.groups(LlamadosXDia, d => (d.fecha).getFullYear());
  GraficaTodo();
 }
//////funciones///