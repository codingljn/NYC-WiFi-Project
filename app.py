from flask import Flask, render_template, json, request, redirect, session
from flask import Markup
from flaskext.mysql import MySQL
from flask import session

mysql = MySQL()
app = Flask(__name__)
app.config['SESSION_TYPE'] = 'memcached'
app.secret_key = 'My secret key?'

# MySQL configurations
app.config['MYSQL_DATABASE_USER'] = 'root'
app.config['MYSQL_DATABASE_PASSWORD'] = 'password'
app.config['MYSQL_DATABASE_DB'] = 'NYCWiFI_db'
app.config['MYSQL_DATABASE_HOST'] = 'localhost'
mysql.init_app(app)


@app.route('/')
def main():
    return render_template('home.html')

@app.route('/chart')
def chart():
    legend = "Stations by Borough"
    conn = mysql.connect()
    cursor =conn.cursor()
    try:
        cursor.execute("SELECT BORONAME FROM wifi_hotspots GROUP BY BORONAME")
        rows = cursor.fetchall()
        labels = list()
        i = 0
        for row in rows:
            labels.append(row[i])
        
        cursor.execute("SELECT count(*) FROM wifi_hotspots GROUP BY BORONAME")
        rows = cursor.fetchall()
        # Convert query to objects of key-value pairs
        values = list()
        i = 0
        for row in rows:
            values.append(row[i])
        cursor.close()
        conn.close()
        
    except:
        print ("Error: unable to fetch items") 

    return render_template('chart.html', values=values, labels = labels, legend=legend)

@app.route('/chart2')
def chart2():
    legend = "Stations by Provider"
    conn = mysql.connect()
    cursor =conn.cursor()
    try:
        cursor.execute("SELECT PROVIDER, total, color from providers")
        rows = cursor.fetchall()
        dataitems = list()
        fld = {} 
        i = 0       
        ##################################
        for row in rows:
            fld['PROVIDER'] = row[0]
            fld['total'] = row[1]
            fld['color'] = row[2]
            dataitems.append(fld.copy()) 
        ##################################
        cursor.close()
        conn.close()
    except:
        print ("Error: unable to fetch items")
    return render_template('chart2.html', dataitems=dataitems)

@app.route('/chart3')
def chart3():
    legend = "Stations by Borough"
    conn = mysql.connect()
    cursor =conn.cursor()
    try:
        cursor.execute("SELECT BORONAME, percent, color from boropercent")
        rows = cursor.fetchall()
        dataitems = list()
        fld = {} 
        i = 0       
        ##################################
        for row in rows:
            fld['BORONAME'] = row[0]
            fld['percent'] = row[1]
            fld['color'] = row[2]
            dataitems.append(fld.copy()) 
        ##################################
        cursor.close()
        conn.close()
    except:
        print ("Error: unable to fetch items")
    return render_template('chart3.html', dataitems=dataitems)


@app.route('/chart4') 
def chart4():
    return render_template('chart4.html') 
    

if __name__ == "__main__":
    app.run(port=5002)
