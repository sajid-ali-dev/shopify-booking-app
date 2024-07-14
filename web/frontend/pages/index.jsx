import {
    IndexTable,
    LegacyCard,
    useIndexResourceState,
    Text,
    Layout,
    Page,
    Spinner,
    Select,
    TextField,
    Checkbox,
    Button,
    LegacyStack,
    CalloutCard,
} from "@shopify/polaris";

import { useState, useEffect } from "react";
import { TitleBar } from "@shopify/app-bridge-react";
import { useTranslation } from "react-i18next";
import { useAuthenticatedFetch } from "../hooks";
import { Toast } from "@shopify/app-bridge-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./Index.css";

const HomePage = () => {
    const navigate = useNavigate();
    const emptyToastProps = { content: null };
    const [toastProps, setToastProps] = useState(emptyToastProps);
    const { t } = useTranslation();

    const [isLoading, setIsLoading] = useState(true);
    const [isBooking, setIsBooking] = useState(false);
    const [isConfigured, setIsConfigured] = useState(false);
    const [globalShipper, setGlobalShipper] = useState("");
    const [errors, setErrors] = useState([]);
    const [success, setSuccess] = useState([]);

    const toastMarkup = toastProps.content && (
        <Toast
            {...toastProps}
            onDismiss={() => setToastProps(emptyToastProps)}
        />
    );

    const fetch = useAuthenticatedFetch();

    const [orders, setOrders] = useState([]);
    const [cities, setCities] = useState([]);
    const [shippers, setShippers] = useState([]);

    const { selectedResources, allResourcesSelected, handleSelectionChange } =
        useIndexResourceState(orders);

    const [searchParams, setSearchParams] = useSearchParams();
    const [rowData, setRowData] = useState([]);

    useEffect(() => {
        initialLoad();
    }, []);

    function initialLoad() {
        const url = "api/oshi/check-crendentials";
        fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);

                if (data.success) {
                    const ids = searchParams.getAll("ids[]").toString();
                    fetchOrders(ids);
                    setIsConfigured(true);
                } else {
                    setIsLoading(false);
                }
            });
    }

    function fetchOrders(ids) {
        if (ids == "") {
            setIsLoading(false);
            return;
        }
        const SHOPIFY_ORDERS_LIST = "api/shopify/orders";
        const url = SHOPIFY_ORDERS_LIST + "?ids=" + ids;
        fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                if (ids != "") {
                    console.log(data);
                    setCities(data.cities);
                    setShippers(data.shippers);
                    setOrders(data.orders);
                    setRowData(data.orders);
                    setIsLoading(false);
                }
            });
        //     .catch((error) => {});
    }

    const resourceName = {
        singular: "order",
        plural: "orders",
    };

    const handlePushOrder = () => {
        setIsBooking(true);

        let allErrors = [];
        rowData.map((data) => {
            let error = "" + data.name + "";
            if (data.phone == "") {
                error += " Phone number,";
            }

            if (data.address == "") {
                error += " Address,";
            }

            if (data.city == "0" || data.city == "") {
                error += " City,";
            }

            if (data.shipper == "0" || !data.shipper) {
                error += " Shipper,";
            }

            if (data.amount == "0") {
                error += " Amount,";
            }

            if (data.weight == "0") {
                error += " Weight,";
            }

            if (error == data.name) {
            } else {
                error += " Missing";
                allErrors.push(error);
            }
        });

        if (allErrors.length > 0) {
            setErrors(allErrors);
            setIsBooking(false);
        } else {
            const PUSH_ORDER = "api/oshi/push-order";
            const url = PUSH_ORDER;
            fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ body: rowData }),
            })
                .then((response) => response.json())
                .then((data) => {
                    setIsBooking(false);
                    if (data != false) {
                        setErrors(data.errors);
                        setSuccess(data.success);
                    }
                })
                .catch((error) => {});
        }
    };

    const handleRowDataChange = (index, fieldName, value) => {
        console.log("vale", value);
        const updatedRowData = [...rowData];
        updatedRowData[index] = {
            ...updatedRowData[index],
            [fieldName]: value,
        };
        setRowData(updatedRowData);
    };

    const handleTrackOrder = () => {};

    function removeRowOption(indexToRemove) {
        let newRowData = rowData.filter((_, index) => index !== indexToRemove);
        console.log(newRowData);
        setOrders(newRowData);
        setRowData(newRowData);
    }

    const handleGlobalShipper = (value) => {
        setGlobalShipper(value);
    };

    const applyGlobalShipper = () => {
        let updatedRowData = [...rowData];
        orders.map((item, index) => {
            updatedRowData[index] = {
                ...updatedRowData[index],
                shipper: globalShipper,
            };
        });

        setRowData(updatedRowData);

        console.log(updatedRowData);
    };

    const handleAction = () => {
        navigate("/settings");
    };

    const rowMarkup = orders.map(({ id, name }, index) => (
        <IndexTable.Row id={id} key={id} position={index}>
            <IndexTable.Cell>
                <Text variant="bodyMd" fontWeight="bold" as="span">
                    {name}
                </Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
                <TextField
                    type="text"
                    value={rowData[index] ? rowData[index].phone : ""}
                    onChange={(e) => handleRowDataChange(index, "phone", e)}
                    autoComplete="off"
                />
            </IndexTable.Cell>
            <IndexTable.Cell>
                <TextField
                    type="text"
                    value={rowData[index] ? rowData[index].address : ""}
                    onChange={(e) => handleRowDataChange(index, "address", e)}
                    autoComplete="off"
                    multiline={2}
                />
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Select
                    options={cities}
                    onChange={(e) => handleRowDataChange(index, "city", e)}
                    value={rowData[index] ? rowData[index].city : 0}
                />
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Select
                    options={shippers}
                    onChange={(e) => handleRowDataChange(index, "shipper", e)}
                    value={rowData[index] ? rowData[index].shipper : 0}
                />
            </IndexTable.Cell>
            {/* <IndexTable.Cell>
                <TextField
                    onChange={(e) =>
                        handleRowDataChange(index, "description", e)
                    }
                    value={rowData[index] ? rowData[index].description : ""}
                    multiline={2}
                    autoComplete="off"
                />
            </IndexTable.Cell> */}
            <IndexTable.Cell>
                <TextField
                    type="number"
                    value={rowData[index] ? rowData[index].amount : ""}
                    onChange={(e) => handleRowDataChange(index, "amount", e)}
                    autoComplete="off"
                />
            </IndexTable.Cell>
            <IndexTable.Cell>
                <TextField
                    type="number"
                    value={rowData[index] ? rowData[index].weight : "0.5"}
                    onChange={(e) => handleRowDataChange(index, "weight", e)}
                    autoComplete="off"
                />
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Checkbox
                    checked={rowData[index] ? rowData[index].parcel : false}
                    onChange={(e) => handleRowDataChange(index, "parcel", e)}
                />
            </IndexTable.Cell>
            <IndexTable.Cell>
                {" "}
                <span
                    onClick={() => removeRowOption(index)}
                    className="removeOption"
                >
                    X
                </span>{" "}
            </IndexTable.Cell>
        </IndexTable.Row>
    ));
    return isLoading ? (
        <Spinner />
    ) : !isConfigured ? (
        <CalloutCard
            title={"Configuration"}
            illustration="https://cdn.shopify.com/s/assets/admin/checkout/settings-customizecart-705f57c725ac05be5a34ec20c05b94298cb8afd10aac7bd9c7ad02030f48cfa0.svg"
            primaryAction={{
                content: "Click here",
                onAction: handleAction,
            }}
        >
            <p>Please provide client ID and Access token</p>
        </CalloutCard>
    ) : (
        <>
            {success.length > 0 ? (
                <Page>
                    <LegacyStack vertical spacing="extraTight">
                        <div className="notification-bar success-message">
                            <span onClick={() => setSuccess([])}>X</span>
                            {success.map((msg, index) => {
                                return <div key={index}>{msg}</div>;
                            })}
                        </div>
                    </LegacyStack>
                </Page>
            ) : null}
            {errors.length > 0 ? (
                <Page>
                    <LegacyStack vertical spacing="extraTight">
                        <div className="notification-bar error-message">
                            <span onClick={() => setErrors([])}>X</span>
                            {errors.map((err, index) => {
                                return <div key={index}>{err}</div>;
                            })}
                        </div>
                    </LegacyStack>
                </Page>
            ) : null}
            {orders.length > 0 ? (
                <Page>
                    <div
                        style={{
                            alignItems: "center",
                            width: "50%",
                            float: "right",
                            marginRight: "82%",
                        }}
                    >
                        <Select
                            label="Select Shipper"
                            options={shippers}
                            onChange={handleGlobalShipper}
                            value={globalShipper}
                            style={{ width: "50%" }}
                        />
                    </div>
                    <div
                        style={{
                            float: "right",
                            marginRight: "74%",
                            marginTop: "-36px",
                        }}
                    >
                        <Button onClick={applyGlobalShipper}>Apply</Button>
                    </div>
                </Page>
            ) : null}
            <Page fullWidth>
                {toastMarkup}
                <TitleBar
                    title={t("Orders.title")}
                    primaryAction={{
                        content: "Push Order(s)",
                        onAction: handlePushOrder,
                        loading: isBooking,
                        disabled: orders.length > 0 ? false : true,
                    }}
                    // secondaryActions={[
                    //     {
                    //         content: "",
                    //         onAction: () => handleTrackOrder,
                    //     },
                    // ]}
                />

                <Layout>
                    <Layout.Section>
                        <LegacyCard>
                            <IndexTable
                                resourceName={resourceName}
                                itemCount={orders.length}
                                selectedItemsCount={
                                    allResourcesSelected
                                        ? "All"
                                        : selectedResources.length
                                }
                                selectable={false}
                                onSelectionChange={handleSelectionChange}
                                headings={[
                                    { title: "Name" },
                                    { title: "Consignee Phone" },
                                    { title: "Consignee Address" },
                                    { title: "Consignee City" },
                                    { title: "Shipper" },
                                    // { title: "Item Description" },
                                    { title: "Amount" },
                                    { title: "Weight" },
                                    { title: "Is OPEN" },
                                    { title: "Action" },
                                ]}
                            >
                                {isLoading ? <Spinner /> : rowMarkup}
                            </IndexTable>
                        </LegacyCard>
                    </Layout.Section>
                </Layout>
            </Page>
        </>
    );
};

export default HomePage;
