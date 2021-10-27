'use strict';
// Default Tableau debugging port is 8696. http://localhost:8696
// Server port is http://localhost:4000

// reference
// https://www.d3-graph-gallery.com/graph/line_several_group.html

let worksheetName = 'Sheet 10'
let filterName = "Region"
let columnName = 'SUM(Sales)'
let valueTarget = 3000000;
let animationDuration = 2000;

let objectConfig = {
  x:-10,
  y:-25,
  size: 0.1
}
let constructLine = (w, h) => {
  // [x1, y1], [x2, y2] ***
  return [[30,  h/2 + 10 ], [w - 120,  h/2 + 10]]
}

// Wrap everything in an anonymous function to avoid poluting the global namespace
(function () {
  document.addEventListener('DOMContentLoaded', function() {
    let width = window.innerWidth - 20
    let height = window.innerHeight - 20
    let straightLine
    let dataArr = [];  

    // Initialize tableau extension
    tableau.extensions.initializeAsync().then(function () {
      // Get worksheets from tableau dashboard
      let unregisterHandlerFunctions = [];
      let worksheet = tableau
                  .extensions
                  .dashboardContent
                  .dashboard
                  .worksheets[tableau.extensions.dashboardContent.dashboard.worksheets.findIndex(i => i.name == worksheetName)]; // ***
      console.log(worksheet)

      function getData() {
        // load data from worksheet
        worksheet.getSummaryDataAsync().then(res => {
          dataArr = []
          const { data, columns } = res
          console.log(data)

          // if you want array of dimension
          data.map(d => {
            let dataJson = {};
            dataJson[columns[0].fieldName] = d[0].value; // 1st Column- Region
            dataJson[columns[1].fieldName] = d[1].value; // 2nd Column- Sum of Sales 
            dataArr.push(dataJson);
          });
        
          height = (( window.innerHeight - 20)/ dataArr.length)
          straightLine = d3.line()(constructLine(width, height))

          console.log(dataArr)
          // plot chart
          dataArr.map((item) => plotChart(item))
        });
      }

      getData();

      // event listener for filters
      let unregisterHandlerFunction = worksheet.addEventListener(tableau.TableauEventType.FilterChanged, filterChangedHandler);
      unregisterHandlerFunctions.push(unregisterHandlerFunction);

      function filterChangedHandler(event) {
        // for filter change ***
        console.log(event.fieldName)
        let els = document.querySelectorAll('svg')
        els.forEach(el => el.remove())
        if (event.fieldName === filterName) {
          // reload summary data
          getData();
        }
      }
    });

    // ========================== D3 CHART ===================== //
    function plotChart(data) {  
      let valueName = data[Object.keys(data)[0]]   
      let valueCurrent = data[columnName] 
      console.log(valueCurrent)
      let valuePercentage = valueCurrent > valueTarget ? 100.0 : ((valueCurrent / valueTarget) * 100).toFixed(1)

      // initialize the initial layout
      var svg = d3.select("body")
        .append('svg')
      var container = svg.append("g")
        .classed('container', true);
      var path = container.append("path").attr('id', 'pathLine')
      var flag = container.append('svg')
      var object = container.append('g')
      var text = container.append('text')
      
      svg
        .attr("width", width)
        .attr("height", height)

      // draw Path
      path
        .attr('d', straightLine)
        .style('fill', 'none')
        .style('stroke', 'rgb(186, 234, 255)')
        .style("stroke-width", 25)

      // draw Object (person/car)
      object
        .attr('fill', 'steelblue')
        .attr('stroke-width', 2)
        .attr('stroke', 'steelblue')
        .style('offset-path', `path("${straightLine}")`)
        .style('offset-distance', "0%")  
        .style('offset-rotate', "0deg")
        .style('transform-origin', 'center')
        .style('transform', `translate( ${ objectConfig.x }px, ${ objectConfig.y }px) scale(${ objectConfig.size })`) // ***


      object
        .append('circle')
        .attr('cx',120)
        .attr('cy',288)
        .attr('r', 12)
      
      object
        .append('circle')
        .attr('cx',408)
        .attr('cy',288)
        .attr('r', 12)

      object
        .append('path')
        .attr('d', 'M477.4,193.036l-88.329-13.4L304.479,110.02A44.128,44.128,0,0,0,276.53,100H159.38a43.778,43.778,0,0,0-34.36,16.514L74.232,180H40A36.04,36.04,0,0,0,4,216v40a44.049,44.049,0,0,0,44,44H69.413a51.988,51.988,0,0,0,101.174,0H357.413a51.988,51.988,0,0,0,101.174,0H472a36.04,36.04,0,0,0,36-36V228.63A35.794,35.794,0,0,0,477.4,193.036Zm-188.165-64.48L351.748,180H236V124h40.53A20.068,20.068,0,0,1,289.235,128.556ZM143.762,131.5A19.9,19.9,0,0,1,159.38,124H164v56H104.967ZM120,316a28,28,0,1,1,28-28A28.032,28.032,0,0,1,120,316Zm288,0a28,28,0,1,1,28-28A28.032,28.032,0,0,1,408,316Zm76-52a12.013,12.013,0,0,1-12,12H458.587a51.988,51.988,0,0,0-101.174,0H170.587a51.988,51.988,0,0,0-101.174,0H48a20.023,20.023,0,0,1-20-20V216a12.013,12.013,0,0,1,12-12H176a12,12,0,0,0,12-12V124h24v68a12,12,0,0,0,12,12H389.684L473.8,216.764A12.081,12.081,0,0,1,484,228.63Z')

      object
        .append('path')
        .attr('d', 'M240,212H224a12,12,0,0,0,0,24h16a12,12,0,0,0,0-24Z')

      object
        .append('circle')
        .attr('cx',120)
        .attr('cy',288)
        .attr('r', 12)
      
      object
        .append('circle')
        .attr('cx',408)
        .attr('cy',288)
        .attr('r', 12)

      // Object run/transition
      object.transition()
        .ease(d3.easeCubicInOut)
        .duration(animationDuration)
        .style('offset-distance', `${valuePercentage}%`)

      // draw flag
      flag
        .attr('width', "30px") // ***
        .attr('height', "30px") // ***
        .attr('fill', 'red') // ***
        .attr('viewBox', "-43 1 456 456.9981")
        .attr('x', width - 120) // position X
        .attr('y', height/2 - 20) // position Y
        .append('path')
        .attr('d', "M305.7773 165.4805c22.3243-28.457 41.6485-44.6328 58.9532-49.375 3.1875-.875 5.6562-3.4102 6.457-6.625.793-3.207-.207-6.5977-2.6172-8.8672-50.457-47.3477-102.707-23.0625-148.8086-1.625-45.6836 21.2383-85.2812 39.4883-125.6992 4.0898V81.9687c11.461-8.5898 18.2852-21.9374 18.2852-36.3984 0-15.4726-7.7422-29.75-20.6211-38.1445-14.7422-9.8281-35.004-9.918-49.9883-.1602C28.703 15.6758 20.918 30 20.918 45.5703c0 14.5469 6.8554 27.9336 18.2851 36.4414V438.711H9.6406C4.5938 438.711.5 442.8047.5 447.8555S4.5938 457 9.6406 457H123.625c5.0469 0 9.1406-4.0937 9.1406-9.1445s-4.0937-9.1446-9.1406-9.1446H94.0625V292.043c16.3594 10.8282 32.8203 15.0352 49.121 15.0352 29.1173 0 57.7227-13.3047 84.2852-25.6523 46.7657-21.7305 87.1563-40.5078 128.582-1.6133 3.2071 2.9883 8.0743 3.3125 11.6173.7383 3.5508-2.5703 4.7812-7.293 2.9336-11.2656-19.504-41.9649-40.7579-76.0196-64.8243-103.8047zm-230 273.2304h-18.289V90.2461c3.0156.625 6.0664 1.039 9.1445 1.039 3.1055 0 6.1524-.4101 9.1445-1.0195zm5.211-369.8359l-.7383.4727c-7.9922 4.75-18.2852 5.1328-27.746-.2852l-.8438-.5469c-7.8008-5.0351-12.457-13.6172-12.457-22.9453 0-9.332 4.6562-17.9101 12.4882-22.9648 4.4805-2.918 9.6524-4.4649 14.9414-4.4649 5.3672 0 10.5352 1.5547 15.0313 4.5547 7.7617 5.0547 12.3984 13.6055 12.3984 22.875 0 9.2656-4.6367 17.8203-13.0742 23.3047zm138.7695 195.9727c-45.6797 21.2421-85.2773 39.496-125.6953 4.0898V126.0508c45.5938 30.1836 91.9805 8.7851 133.4063-10.4727 42.457-19.7422 79.6406-37.0351 117.1601-10.9453-18.0586 9.6055-36.8516 27.7305-58.0039 55.75-2.6484 3.5078-2.4258 8.4024.5313 11.6602 18.6953 20.5703 35.6757 45.043 51.4726 74.2226-40.8476-17.6875-81.8398 1.3594-118.871 18.582zm0 0")


      text
        .attr('x', width - 120 + 30 + 10)
        .attr('y', height/2)
        .style('overflow', 'visible')
        
      text.append('tspan')
        .attr('x', width - 120 + 30 + 10)
        .attr('dy', 0)
        .attr('font-size', 8)
        .text(d => `${ valueName }`)
        
      text.append('tspan')
        .attr('x', width - 120 + 30 + 10)
        .attr('dy', 15)
        .attr('font-size', 12)
        .attr('font-weight', 'bold')
        .text(d => `${ valuePercentage }%`)
        
    }
  }, false);
})();