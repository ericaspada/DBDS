/// setup
use GEO
geo = db.GEO
// count
geo.count()
// return first n documents
geo.find().limit(2)
// a simple query - need to use \ to escape
geo.find({"FactorValue [TIME]\\":"48h\\"}).count()
// find the distinct values for a field
geo.distinct("Comment [Sample_source_name]")
// rename columns
geo.updateMany( {}, { $rename: { "oldname": "newname" } } )
// this is a projection
geo.find({},{"Comment [Sample_source_name]":1, 'A_23_P252981':1})

///  CORRELATION ///
// each infection type + hour combination has 3 replicates
// for now using all the data (instead of taking average of the 3 replicates) 
// pick two probes to compare
var probe1_name = 'A_23_P100486'
var probe2_name = 'A_23_P100469'
var allsamples = geo.find().toArray()

var probe1 = [];
allsamples.forEach(function(sample){
    var expression_value = sample[probe1_name]
    probe1.push(expression_value)
})
probe1 // this is our x

var probe2 = [];
allsamples.forEach(function(sample){
    var expression_value = sample[probe2_name]
    probe2.push(expression_value)
})
probe2 // this is our y

function corr(x, y){
    var n = x.length
    var sumx = x.reduce((a,b) => a+b);
    var sumy = y.reduce((a,b) => a+b);
    var meanx = sumx/n
    var meany = sumy/n
    var x2 = x.map(x => Math.pow(x,2));
    var y2 = y.map(y => Math.pow(y,2));
    var sumx2 = x2.reduce((a,b) => a+b);
    var sumy2 = y2.reduce((a,b) => a+b);
    var sumxy = x.reduce(function(r,a,i){return r+a*y[i]},0);
    var sxx = sumx2 - ((Math.pow(sumx,2))/n)
    var sxy = sumxy - ((sumx * sumy)/n)
    var syy = sumy2 - (n * Math.pow(meany,2))
    var r = sxy/Math.sqrt(sxx*syy)
    return r;  
}
corr(probe1, probe2)

/// Z SCORES ///
// one categorical variable (infection type) and one numerical variable (a particular probe)
var aggregated = geo.aggregate(
   [{$project: {"Comment [Sample_source_name]":1,"FactorValue [INFECTION CODE]":1,
       'FactorValue [TIME]\\':1, 'A_23_P252981':1}},
   {$match: {'FactorValue [TIME]\\':'48h\\'}}, // take only 48h data
   {$group: {_id: "$FactorValue [INFECTION CODE]",
       infection_avg: {$avg: '$A_23_P252981'}}} // take the average of the 3 replicates
   ]
).toArray()
aggregated
   
//A_23_P100263
//A_23_P252981

// use 'push' to create an array with the just expression values
var expression_values = [];
aggregated.forEach(function(record){
    var expression_value = record['infection_avg']
    expression_values.push(expression_value)
})
expression_values

// calculates z score given an array of x values and a single x (group mean)
function zscore(arr, x){
    var n = arr.length
    var meanx = arr.reduce((a,b) => a+b)/n;
    var se = Math.sqrt(arr.map(arr => Math.pow(arr-meanx,2)).reduce((a,b) => a+b)/(n-1))/Math.sqrt(n)// standard error
    var z = (x - meanx)/se
    return z;
};

// create an array with infection type, expression value, and z-score
var zscores = [];
aggregated.forEach(function(record){
    var infection_type = record['_id']
    var expression_value = record['infection_avg']
    zscores.push({infection_type: infection_type,
        expression_value: expression_value,
        zscore: zscore(expression_values, expression_value)})
})
zscores