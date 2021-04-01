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
const basicAuth = "Basic " + btoa("ahmed:Atwabi@20");
const MainForm = (props) => {

    var periods = ["Choose By","Week", "Month"];

    const [showLoading, setShowLoading] = useState(false);
    const [programs, setPrograms] = useState([]);
    const [programStages, setProgramStages] = useState([]);
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [D2, setD2] = useState();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [resultModal, setResultModal] = useState(false);
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
    const [secondVariable, setSecondVariable] = useState();
    const [allStages, setAllStages] = useState([]);
    const [results, setResults] = useState([]);
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
    };

    const showResultModal = () => {
        setResultModal(true);
    };

    const handleResultsCancel = () => {
        setResultModal(false);
    };

    const handleResultOk = () => {
        setResultModal(false);
    };
    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    function makeID(length) {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    const handleOk = () => {
        console.log(selectedDate);
        var date = moment(selectedDate).format("YYYY-MM-DDTHH:mm:ss.SSS");
        console.log(moment(selectedDate).format("YYYY-MM-DDTHH:mm:ss.SSS"));

        var valueArray = [];
        events.map((event) => {
            var eventID = event.event;

            var eventPayload = {
                "storedBy": event.storedBy,
                "dueDate": event.dueDate,
                "program": event.program,
                "href": event.href,
                //"event": eventID,
                "programStage": secondVariable.id,
                "orgUnit": "edb4aTWzQaZ",
                "trackedEntityInstance": event.trackedEntityInstance,
                "enrollment": event.enrollment,
                "enrollmentStatus": event.enrollmentStatus,
                "status": event.status,
                "orgUnitName": event.orgUnitName,
                "eventDate": event.eventDate,
                "attributeCategoryOptions": event.attributeCategoryOptions,
                "lastUpdated": date,
                "created": date,
                "completedDate": event.completedDate,
                "followup": event.followup,
                "deleted": event.deleted,
                "attributeOptionCombo": event.attributeOptionCombo,
                "completedBy": event.completedBy,
                "dataValues": [],
                "notes": [ ],
                "createdByUserInfo": {
                    "firstName": event.createdByUserInfo && event.createdByUserInfo.firstName,
                    "surname": event.createdByUserInfo && event.createdByUserInfo.surname,
                    "uid": event.createdByUserInfo && event.createdByUserInfo.uid,
                    "username": event.createdByUserInfo && event.createdByUserInfo.username,
                },
                "lastUpdatedByUserInfo" : {
                    "firstName": event.lastUpdatedByUserInfo && event.lastUpdatedByUserInfo.firstName,
                    "surname": event.lastUpdatedByUserInfo && event.lastUpdatedByUserInfo.surname,
                    "uid": event.lastUpdatedByUserInfo && event.lastUpdatedByUserInfo.uid,
                    "username": event.lastUpdatedByUserInfo && event.lastUpdatedByUserInfo.username,
                }
            }

            event.dataValues && event.dataValues.map((dataValue) => {
                valueArray.push(
                    {
                        "lastUpdated": dataValue.lastUpdated,
                        "storedBy": dataValue.storedBy,
                        "created": dataValue.created,
                        "dataElement": dataValue.dataElement,
                        "value": dataValue.value,
                        "providedElsewhere": dataValue.providedElsewhere
                    }
                )
            });

            eventPayload.dataValues = valueArray;

            console.log(eventPayload);


            fetch(`https://covmw.com/namistest/api/events`, {
                method: 'POST',
                body: JSON.stringify(eventPayload),
                headers: {
                    'Authorization' : basicAuth,
                    'Content-type': 'application/json',
                },
                credentials: "include"

            })
                .then(response => {
                    console.log(response);

                    if(response.status === 200 || response.status === 201){
                        setResults(results => [...results, {"event": event.event, "message" : "Successfully re-created"}]);
                    } else {
                        setResults(results => [...results, {"event": event.event, "message" : "Unable to re-create"}]);
                    }
                })
                .catch((error) => {
                    setResults(results => [...results, {"event": event.event, "message" : "Unable to re-create"}]);
                });

        });

        setIsModalVisible(false);
        setResultModal(true);
    };

    const handleProgramStage = selectedOption => {
        //console.log(selectedOption);
        setSelectedProgramStage(selectedOption);
        var name = selectedOption.label.split("-")[1].trim();

        console.log(allStages);
        allStages.map((stage) => {
            var stageName = stage.label.split("-")[1].trim();

            if(name === stageName && stage.label.includes("Round 2")){
                console.log(stage)
                setSecondVariable(stage);
            }
        })
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
                    const tempArray = [];
                    const anotherArray = [];

                    response.programStages.map((item, index) => {

                        if(item.name.includes("Round 1")){
                            tempArray.push({"id" : item.id, "label" : item.name});
                        }

                        if(item.name.includes("Round")){
                            anotherArray.push({"id" : item.id, "label" : item.name});
                        }
                    });
                    setProgramStages(tempArray);
                    setAllStages(anotherArray);
                })
                .catch((error) => {
                    console.log(error);
                    alert("An error occurred: " + error);
                });
        });
    };

    const handleFetchEvents = () => {

        setResults([]);
        setShowLoading(true);
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
                    response.events.map((item) => {
                        var date = moment(item.eventDate);
                        if (date.isBetween(start, end)) {
                            tempArray.push(item);
                        }
                    });

                    console.log(tempArray);
                    setEvents(tempArray);
                }).then(() => {
                    showModal();
                    setShowLoading(false);
                })
                .catch((error) => {
                    console.log(error);
                    alert("An error occurred: " + error);
                });
        });

    }


    return (
        <div>
            <Modal title="Operation Results" visible={resultModal} onOk={handleResultOk} onCancel={handleResultsCancel}>
                {results.map((result, key) => (
                    <p key={key}>Event: {result.event} ==> {result.message}</p>
                ))}

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