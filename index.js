import fetch from 'node-fetch';
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3000;

// URL bazë për BambooHR API
const BAMBOOHR_API_BASE_URL = 'https://api.bamboohr.com/api/gateway.php/91life/v1';
const API_KEY = process.env.BAMBOOHR_API_KEY;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post('/slack/commands', async (req, res) => {
    const command = req.body.command; 
    const employeeName = req.body.text ? req.body.text.trim() : ''; 
    const today = new Date().toISOString().split('T')[0]; 
    console.log('Komanda e pranuar:', command);
    console.log('Emri i kërkuar:', employeeName);

    try {
        if (command === '/kueshte' && employeeName) {
            console.log('Duke bërë kërkesë te BambooHR për të gjithë punonjësit...');

            const employeeResponse = await fetch(`${BAMBOOHR_API_BASE_URL}/employees/directory`, {
                method: 'GET',
                headers: {
                    'Authorization': `Basic ${Buffer.from(`${API_KEY}:x`).toString('base64')}`,
                    'Accept': 'application/json',
                }
            });

            if (!employeeResponse.ok) {
                console.error('Failed to fetch employees from BambooHR', employeeResponse.statusText);
                return res.json({ text: 'Dicka shkoi keq gjatë përpunimit të kërkesës.' });
            }

            const employees = await employeeResponse.json();
            const employeeExists = employees.employees.find(emp => emp.displayName.toLowerCase() === employeeName.toLowerCase());

            if (!employeeExists) {
                return res.json({ text: `Personi me emrin ${employeeName} nuk gjindet.` });
            }

            console.log('Duke bërë kërkesë te BambooHR për listën e atyre që janë jashtë zyrës...');

            const timeOffResponse = await fetch(`${BAMBOOHR_API_BASE_URL}/time_off/whos_out`, {
                method: 'GET',
                headers: {
                    'Authorization': `Basic ${Buffer.from(`${API_KEY}:x`).toString('base64')}`,
                    'Accept': 'application/json',
                }
            });

            if (!timeOffResponse.ok) {
                console.error('Failed to fetch data from BambooHR', timeOffResponse.statusText);
                return res.json({ text: 'Dicka shkoi keq gjatë përpunimit të kërkesës.' });
            }

            const timeOffData = await timeOffResponse.json();
            const employeeOut = timeOffData.find(emp => emp.name.toLowerCase() === employeeName.toLowerCase() && today >= emp.start && today <= emp.end);

            if (employeeOut) {
                res.json({ text: `${employeeName} është jashtë zyrës për arsye: ${employeeOut.type}, nga ${employeeOut.start} deri më ${employeeOut.end}.` });
            } else {
                res.json({ text: `${employeeName} duhet të jetë në zyrë, pasi qe nuk ka pushim zyrtar.` });
            }

        } else if (command === '/whoisaway') {
            console.log('Duke bërë kërkesë te BambooHR për listën e atyre që janë jashtë zyrës...');

            const timeOffResponse = await fetch(`${BAMBOOHR_API_BASE_URL}/time_off/whos_out`, {
                method: 'GET',
                headers: {
                    'Authorization': `Basic ${Buffer.from(`${API_KEY}:x`).toString('base64')}`,
                    'Accept': 'application/json',
                }
            });

            if (!timeOffResponse.ok) {
                console.error('Failed to fetch data from BambooHR', timeOffResponse.statusText);
                return res.json({ text: 'Dicka shkoi keq gjatë përpunimit të kërkesës.' });
            }

            const timeOffData = await timeOffResponse.json();

            if (timeOffData.length === 0) {
                res.json({ text: 'Të gjithë janë në zyrë sot.' });
            } else {
                const awayList = timeOffData.map(emp => `${emp.name} është jashtë zyrës për arsye: ${emp.type}, nga ${emp.start} deri më ${emp.end}.`).join('\n');
                res.json({ text: `Punonjësit që janë jashtë zyrës:\n${awayList}` });
            }
        } else if (command === '/checkin') {
            console.log('Duke bërë kërkesë te BambooHR për hyrjet në zyrë...');

            const now = new Date().toISOString().split('T')[0]; 
            const timesheetResponse = await fetch(`${BAMBOOHR_API_BASE_URL}/time_tracking/timesheet_entries?start=${now}&end=${now}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Basic ${Buffer.from(`${API_KEY}:x`).toString('base64')}`,
                    'Accept': 'application/json',
                }
            });

            if (!timesheetResponse.ok) {
                console.error('Failed to fetch timesheet entries from BambooHR', timesheetResponse.statusText);
                return res.json({ text: 'Dicka shkoi keq gjatë përpunimit të kërkesës.' });
            }

            const timesheetData = await timesheetResponse.json();
            console.log('Timesheet entries:', timesheetData);

            const employeeResponse = await fetch(`${BAMBOOHR_API_BASE_URL}/employees/directory`, {
                method: 'GET',
                headers: {
                    'Authorization': `Basic ${Buffer.from(`${API_KEY}:x`).toString('base64')}`,
                    'Accept': 'application/json',
                }
            });

            if (!employeeResponse.ok) {
                console.error('Failed to fetch employees from BambooHR', employeeResponse.statusText);
                return res.json({ text: 'Dicka shkoi keq gjatë përpunimit të kërkesës.' });
            }

            const employees = await employeeResponse.json();

            const currentTime = new Date();
            const checkinList = timesheetData.filter(entry => new Date(entry.start) <= currentTime && !entry.end);

            if (checkinList.length === 0) {
                res.json({ text: 'Nuk ka hyrje për punonjës që kanë bërë check-in para kësaj kohe.' });
            } else {
                const checkinText = checkinList.map(entry => {
                    const employee = employees.employees.find(emp => emp.id == entry.employeeId);
                    const employeeName = employee ? employee.displayName : `ID ${entry.employeeId}`;
                    return `${employeeName} ka bërë check-in më ${entry.start}`;
                }).join('\n');
                res.json({ text: `Punonjësit që kanë bërë check-in:\n${checkinText}` });
            }
        } else {
            res.json({ text: 'Komandë e panjohur.' });
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ text: 'Dicka shkoi keq gjatë përpunimit të kërkesës.' });
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
