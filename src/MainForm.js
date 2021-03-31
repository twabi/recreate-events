import React, {useEffect, useState} from "react";
import {Modal, Button, DatePicker, Divider} from 'antd';
import {Dropdown, Menu, Space} from "antd";
import Select from "react-select";
import {getInstance} from "d2";
import {DownOutlined} from "@ant-design/icons";
import Header from "@dhis2/d2-ui-header-bar"
import "antd/dist/antd.css";
import "./index.css";
import {
    MDBBox,
    MDBCard,
    MDBCardBody, MDBCardFooter,
    MDBCardText,
    MDBCardTitle,
    MDBCol,
    MDBContainer,
    MDBRow,
} from "mdbreact";

var moment = require("moment");
const { RangePicker } = DatePicker;
const MainForm = (props) => {

    var periods = ["Choose By","Week", "Month"];

    const [showLoading, setShowLoading] = useState(false);
    const [programs, setPrograms] = useState([]);
    const [programStages, setProgramStages] = useState([]);
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [D2, setD2] = useState();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [dates, setDates] = useState([]);
    const [hackValue, setHackValue] = useState();
    const [range, setRange] = useState(7);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [value, setValue] = useState();
    const [selectedDate, setSelectedDate] = useState();
    const [thisPeriod, setThisPeriod] = useState(periods[0]);
    const [selectedProgramStage, setSelectedProgramStage] = useState(null);
    const [events, setEvents] = useState([]);
    //setSummary(summary => [...summary, {"enrolment": enrolID, "message" : "Successfully deleted"}]);
    getInstance().then(d2 =>{
        setD2(d2);
    });

    const menu = (
        <Menu>
            {periods.map((item, index) => (
                <Menu.Item key={index} onClick={()=>{handlePeriod(item)}}>
                    {item}
                </Menu.Item>
            ))}
        </Menu>
    );

    const disabledDate = current => {
        if (!dates || dates.length === 0) {
            return false;
        }
        const tooLate = dates[0] && current.diff(dates[0], 'days') > range;
        const tooEarly = dates[1] && dates[1].diff(current, 'days') > range;
        return tooEarly || tooLate;
    };

    const onOpenChange = open => {
        if (open) {
            setHackValue([]);
            setDates([]);
        } else {
            setHackValue(undefined);
        }
    };

    const handlePeriod = (value) => {
        setThisPeriod(value);
        if(value === "Week"){
            setRange(7);
        } else if(value === "Month"){
            setRange(30);
        } else {
            setRange(7);
        }
    };

    function onChange(date, dateString) {
        console.log(date, dateString);
        setSelectedDate(date);
    }

    const handleDateChange = (selectedValue) => {
        setValue(selectedValue);
        const valueOfInput1 = selectedValue && selectedValue[0].format().split("+");
        const valueOfInput2 = selectedValue && selectedValue[1].format().split("+");

        setStartDate(valueOfInput1[0])
        setEndDate(valueOfInput2[0])
    }

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleOk = () => {
        setIsModalVisible(false);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleProgramStage = selectedOption => {
        console.log(selectedOption);
        setSelectedProgramStage(selectedOption);
    }


    useEffect(() => {
        setPrograms(props.programs);

    },[props.programs, props.d2]);


    const handleProgram = selectedOption => {
        console.log(selectedOption);
        setSelectedProgram(selectedOption);

        getInstance().then((d2) => {
            const stagePoint = `programs/${selectedOption.id}.json?fields=programStages[id,name]`;
            d2.Api.getApi().get(stagePoint)
                .then((response) => {
                    const tempArray = []
                    response.programStages.map((item, index) => {
                        tempArray.push({"id" : item.id, "label" : item.name});
                    });
                    setProgramStages(tempArray);
                })
                .catch((error) => {
                    console.log(error);
                    alert("An error occurred: " + error);
                });
        });
    };

    const handleFetchEvents = () => {

        console.log(selectedProgram.id);
        console.log(selectedProgramStage.id);
        console.log(startDate + "-" + endDate);

        var programID = selectedProgram.id;
        var stageID = selectedProgramStage.id;
        var start = moment(startDate);
        var end = moment(endDate);

        getInstance().then((d2) => {
            const eventsPoint = `events.json?program=${programID}&programStage=${stageID}`;
            var tempArray = []
            d2.Api.getApi().get(eventsPoint)
                .then((response) => {
                    console.log(response.events);
                    response.events.map((item) => {
                        var date = moment(item.eventDate);
                        if (date.isBetween(start, end)) {
                            tempArray.push(item);
                        }
                    });

                    setEvents(tempArray);
                }).then(() => {
                    showModal();
                })
                .catch((error) => {
                    console.log(error);
                    alert("An error occurred: " + error);
                });
        });

    }


    return (
        <div>
            <Modal title="Basic Modal" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
                <p>Events Recreated successfully!</p>
            </Modal>
            {D2 && <Header className="mb-5" d2={D2}/>}
            <MDBBox className="mt-5" display="flex" justifyContent="center" >
                <MDBCol className="mb-5 mt-5" md="10">
                    <MDBCard display="flex" justifyContent="center" className="text-xl-center w-100">
                        <MDBCardBody>
                            <MDBCardTitle>
                                <strong>Recreate Events</strong>
                            </MDBCardTitle>

                            <MDBCardText>
                                <strong>Select program and the period range of the events to be replicated</strong>
                            </MDBCardText>
                            {programs.length === 0 ? <div className="spinner-border mx-2 indigo-text spinner-border-sm" role="status">
                                <span className="sr-only">Loading...</span>
                            </div> : null}

                            <hr/>

                            <Divider orientation="left" className="font-italic">Select Round 1 program and Period</Divider>

                            <MDBContainer className="pl-5 mt-3 mb-3">
                                <MDBRow>
                                    <MDBCol md={4}>
                                        <div className="text-left my-3">
                                            <label className="grey-text ml-2">
                                                <strong>Select Program</strong>
                                            </label>
                                            <Select
                                                className="mt-2 w-100"
                                                onChange={handleProgram}
                                                options={programs}
                                            />
                                        </div>
                                    </MDBCol>

                                    <MDBCol md={4}>
                                        <div className="text-left my-3">
                                            <label className="grey-text ml-2">
                                                <strong>Select Program Stages</strong>
                                            </label>
                                            <Select
                                                className="mt-2 w-100"
                                                onChange={handleProgramStage}
                                                options={programStages}
                                            />
                                        </div>
                                    </MDBCol>

                                    <MDBCol md={4}>
                                        <div className="text-left my-3">
                                            <label className="grey-text ml-2">
                                                <strong>Select Start & End Date</strong>
                                                <Dropdown overlay={menu} className="ml-3">
                                                    <Button size="small">{thisPeriod} <DownOutlined /></Button>
                                                </Dropdown>
                                            </label>

                                            <Space direction="vertical" size={12}>

                                                <RangePicker
                                                    className="mt-1"
                                                    style={{ width: "100%" }}
                                                    value={hackValue || value}
                                                    disabledDate={disabledDate}
                                                    size="large"
                                                    onCalendarChange={val => setDates(val)}
                                                    onChange={handleDateChange}
                                                    onOpenChange={onOpenChange}
                                                />
                                            </Space>

                                        </div>

                                    </MDBCol>
                                </MDBRow>
                            </MDBContainer>

                            <Modal title="Select Period for Round 2 Re-created Events" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>

                                <MDBContainer>
                                    <MDBRow>

                                        <MDBCol md={12}>
                                            <MDBRow>
                                                <Space direction="vertical" size={12}>

                                                    <DatePicker
                                                        className="mt-1 w-100"
                                                        size="large"
                                                        placeholder="Select date of events"
                                                        style={{ minWidth: "24rem" }}
                                                        onChange={onChange}
                                                    />
                                                </Space>
                                            </MDBRow>
                                            <MDBRow className="d-flex justify-content-center align-items-center">

                                                {showLoading ? <>
                                                    <div className="spinner-border text-center mt-2 mr-5 text-primary spinner-border-sm" role="status">
                                                        <span className="sr-only">Loading...</span>
                                                    </div>
                                                </> : null}
                                            </MDBRow>

                                        </MDBCol>
                                    </MDBRow>
                                </MDBContainer>
                            </Modal>

                        </MDBCardBody>
                        <MDBCardFooter>
                            <Button type="primary" size="large" className="text-white" onClick={() => {
                                handleFetchEvents()
                                //showModal();
                            }}>
                                Recreate{showLoading ? <div className="spinner-border mx-2 text-white spinner-border-sm" role="status">
                                <span className="sr-only">Loading...</span>
                            </div> : null}
                            </Button>
                        </MDBCardFooter>
                    </MDBCard>
                </MDBCol>
            </MDBBox>

        </div>
    )
}

export default MainForm;