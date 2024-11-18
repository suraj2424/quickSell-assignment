import React, { useState, useEffect } from "react";
import down from "../assets/images/down.svg";
import Display from "../assets/images/Display.svg";
import Backlog from "../assets/images/Backlog.svg";
import Todo from "../assets/images/To-do.svg";
import InProgress from "../assets/images/in-progress.svg";
import Done from "../assets/images/Done.svg";
import Canceled from "../assets/images/Cancelled.svg";
import HighPriority from "../assets/images/Img - High Priority.svg";
import MediumPriority from "../assets/images/Img - Medium Priority.svg";
import LowPriority from "../assets/images/Img - Low Priority.svg";
import NoPriority from "../assets/images/No-priority.svg";
import UrgentPriority from "../assets/images/SVG - Urgent Priority colour.svg";

const KanbanBoard = () => {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [grouping, setGrouping] = useState("status");
  const [ordering, setOrdering] = useState("priority");
  const [isDisplayMenuOpen, setIsDisplayMenuOpen] = useState(false);
  const [userColors, setUserColors] = useState({});

  const getUserInitials = (name) => {
    const nameParts = name.split(" ");
    return (
      nameParts[0][0] + (nameParts[1] ? nameParts[1][0] : "")
    ).toUpperCase();
  };

  const getUserColor = (userId) => {
    return userColors[userId] || "#ddd";
  };

  useEffect(() => {
    fetch("https://api.quicksell.co/v1/internal/frontend-assignment")
      .then((response) => response.json())
      .then((data) => {
        setTickets(data.tickets);
        setUsers(data.users);

        // Assign colors to users when data is loaded
        const colors = [
          "#FF0000", // Bright Red
          "#00D1B2", // Bold Teal
          "#0077CC", // Bold Blue
          "#009966", // Bold Green
          "#FFCC00", // Bold Yellow
          "#CC6666", // Bold Pinkish Red
          "#8E44AD", // Deep Purple
          "#2980B9", // Bold Sky Blue
        ];

        const colorMap = {};
        data.users.forEach((user, index) => {
          colorMap[user.id] = colors[index % colors.length];
        });
        setUserColors(colorMap);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const statusOrder = [
    { id: 1, name: "Backlog", icon: Backlog },
    { id: 2, name: "Todo", icon: Todo },
    { id: 3, name: "In Progress", icon: InProgress },
    { id: 4, name: "Done", icon: Done },
    { id: 5, name: "Canceled", icon: Canceled },
  ];

  const priorityIcons = [
    { id: 1, name: "Low", icon: LowPriority },
    { id: 2, name: "Medium", icon: MediumPriority },
    { id: 3, name: "High", icon: HighPriority },
    { id: 4, name: "Urgent", icon: UrgentPriority },
    { id: 0, name: "No priority", icon: NoPriority },
  ];

  const groupTickets = (tickets) => {
    if (grouping === "status") {
      const grouped = statusOrder.reduce((acc, status) => {
        acc[status.name] = [];
        return acc;
      }, {});

      tickets.forEach((ticket) => {
        const normalizedStatus = ticket.status
          .split(" ")
          .map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join(" ");

        const status =
          normalizedStatus === "In-progress" ? "In Progress" : normalizedStatus;
        if (grouped.hasOwnProperty(status)) {
          grouped[status].push(ticket);
        } else {
          // Handle cases where status might not match exactly
          const matchingStatus = statusOrder.find(
            (s) => s.name.toLowerCase() === status.toLowerCase()
          );
          if (matchingStatus) {
            grouped[matchingStatus.name].push(ticket);
          }
        }
      });

      return grouped;
    }

    switch (grouping) {
      case "user":
        return tickets.reduce((acc, ticket) => {
          const user =
            users.find((u) => u.id === ticket.userId)?.name || "Unassigned";
          if (!acc[user]) acc[user] = [];
          acc[user].push(ticket);
          return acc;
        }, {});
      case "priority":
        const priorityNames = {
          0: "No priority",
          4: "Urgent",
          3: "High",
          2: "Medium",
          1: "Low",
        };
        return tickets.reduce((acc, ticket) => {
          const priority = priorityNames[ticket.priority];
          if (!acc[priority]) acc[priority] = [];
          acc[priority].push(ticket);
          return acc;
        }, {});
      default:
        return { "All Tickets": tickets };
    }
  };

  const orderTickets = (tickets) => {
    switch (ordering) {
      case "priority":
        return [...tickets].sort((a, b) => b.priority - a.priority);
      case "title":
        return [...tickets].sort((a, b) => a.title.localeCompare(b.title));
      default:
        return tickets;
    }
  };

  const groupedTickets = groupTickets(tickets);

  return (
    <div className="kanban-container">
      <header className="header">
        <button
          className="display-button"
          onClick={() => setIsDisplayMenuOpen(!isDisplayMenuOpen)}
          aria-expanded={isDisplayMenuOpen}
          aria-controls="display-menu"
        >
          <img src={Display} alt="Display options" />
          Display
          <img src={down} alt="" />
        </button>

        {isDisplayMenuOpen && (
          <div
            id="display-menu"
            className="display-menu"
            role="menu"
            aria-hidden={!isDisplayMenuOpen}
          >
            <div className="menu-section">
              <label>Grouping</label>
              <select
                value={grouping}
                onChange={(e) => setGrouping(e.target.value)}
              >
                <option value="status">Status</option>
                <option value="user">User</option>
                <option value="priority">Priority</option>
              </select>
            </div>
            <div className="menu-section">
              <label>Ordering</label>
              <select
                value={ordering}
                onChange={(e) => setOrdering(e.target.value)}
              >
                <option value="priority">Priority</option>
                <option value="title">Title</option>
              </select>
            </div>
          </div>
        )}
      </header>

      <div className="board">
        {(grouping === "status"
          ? statusOrder.map((status) => status.name)
          : Object.keys(groupedTickets)
        ).map((groupName) => {
          const statusInfo = statusOrder.find(
            (status) => status.name === groupName
          ) || { name: groupName, icon: "" };

          // Find the user for user grouping
          const groupUser =
            grouping === "user"
              ? users.find((u) => u.name === groupName)
              : null;

          return (
            <div
              key={groupName}
              className="column"
              style={{
                minWidth: "0",
                width: "100%",
              }}
            >
              <div className="column-header">
                <div className="column-title">
                  {grouping === "priority" && (
                    <img
                      src={
                        priorityIcons.find(
                          (priority) => priority.name === groupName
                        ).icon
                      }
                      alt=""
                    />
                  )}
                  {grouping === "status" && (
                    <img src={statusInfo.icon} alt="" />
                  )}
                  {grouping === "user" && groupUser && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <div
                        className="avatar"
                        style={{
                          backgroundColor: getUserColor(groupUser.id),
                          position: "relative",
                          width: "30px",
                          height: "30px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontSize: "12px",
                          fontWeight: "500",
                        }}
                      >
                        {getUserInitials(groupUser.name)}
                        <div style={{
                            position: "absolute",
                            bottom: "-4px",
                            right: "-2px",
                            backgroundColor: groupUser.av ? "green" : "gray",
                            width: "8px",
                            height: "8px",
                            border: "2px solid white",
                            borderRadius: "50%",
                          }}>

                          </div>
                          </div>
                    </div>
                  )}
                  <h2>{groupName}</h2>
                  <span className="ticket-count">
                    {groupedTickets[groupName]?.length || 0}
                  </span>
                </div>
                <div className="column-actions">
                  <button className="add-button">+</button>
                  <button className="more-button">⋯</button>
                </div>
              </div>

              <div className="tickets">
                {orderTickets(groupedTickets[groupName] || []).map((ticket) => (
                  <div key={ticket.id} className="ticket">
                    <div className="ticket-header">
                      <span className="ticket-id">{ticket.id}</span>
                      {!(grouping === "user") && (
                        <div
                          className="avatar"
                          style={{
                            backgroundColor: getUserColor(ticket.userId),
                            width: "25px",
                            height: "25px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontSize: "12px",
                            fontWeight: "500",
                          }}
                        >
                          {(() => {
                            const user = users.find(
                              (u) => u.id === ticket.userId
                            );
                            return user ? getUserInitials(user.name) : "";
                          })()}
                          <div style={{
                            position: "absolute",
                            bottom: "-4px",
                            right: "-2px",
                            backgroundColor: users.find((user)=> {
                              return user.id === ticket.userId
                            }).available ? "green" : "gray",
                            width: "8px",
                            height: "8px",
                            border: "2px solid white",
                            borderRadius: "50%",
                          }}>

                          </div>
                        </div>
                      )}
                    </div>

                    <div className="ticket-title">
                      {grouping === "priority" && (
                        <img
                          src={
                            statusOrder.find(
                              (status) =>
                                status.name.toLowerCase() ===
                                ticket.status.toLowerCase()
                            ).icon
                          }
                          alt=""
                        />
                      )}
                      <h3>{ticket.title}</h3>
                    </div>

                    <div className="ticket-tags">
                      {ticket.tag.map((tag, index) => (
                        <div key={index}>
                          <div>
                            <img
                              src={
                                priorityIcons.find(
                                  (priority) => priority.id === ticket.priority
                                ).icon
                              }
                              alt=""
                            />
                          </div>
                          <span className="tag">
                            <span className="tag-circle"></span>
                            {tag}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KanbanBoard;
