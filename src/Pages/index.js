import React, {useState,useEffect} from 'react';
import { Layout, Button, Drawer  } from 'antd';
import { MenuOutlined } from '@ant-design/icons';

import {Navigate , Routes , Route} from 'react-router-dom';
import Assessment from './Assessment';

import '../App.css';
import Skills from './Skills';
import Dashboard from './Dashboard';

const { Header , Footer } = Layout;

function AppLayout() {
    //To manage the sidebar drawer
    const [open, setOpen] = useState(false);
    const showDrawer = () => {
        setOpen(true);
    };

    const onClose = () => {
        setOpen(false);
    };
    
    return (
        <Layout>
        <Header>
            <div className="header-wrapper">
                <h1>Vizbee</h1>
                <MenuOutlined className="icon-menu" onClick={showDrawer}/>
            </div>
        </Header>

        <Drawer title="Vizbee" placement="left" onClose={onClose} open={open}>
            <div className="drawer-body">
                <Button type="link" href="/app/dashboard">Dashboard</Button>
                <Button type="link" href="/app/skills">Skills</Button>
                <Button type="link" href="/app/assessment">Assessment</Button>
            </div>
        </Drawer>

        <>
            <Routes>
                <Route path="/" element={<Navigate to="/app/assessment" />} />
                <Route path="/assessment" element={<Assessment />}></Route>
                <Route path="/skills" element={<Skills />}></Route>
                <Route path="/dashboard" element={<Dashboard />}></Route>
            </Routes>
        </>

        <Footer>
            Vizbee App ©2023 | All rights reserved.
        </Footer>
    </Layout>
)
}

export default AppLayout