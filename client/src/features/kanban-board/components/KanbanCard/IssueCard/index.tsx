import { Avatar, Card, Tooltip } from '@mantine/core';
import { useIsMutating, useIsFetching } from '@tanstack/react-query';
import React, { KeyboardEvent } from 'react';
import { Draggable } from 'react-beautiful-dnd';

import {
  BugIcon,
  HighPriorityIcon,
  LowPriorityIcon,
  MediumPriorityIcon,
  StoryIcon,
  TaskIcon,
} from 'assets/icons';
import { User } from 'types';
import { capitalizeFirstLetter } from 'utils/capitalizeFirstLetter';
import { getInitials } from 'utils/getInitials';

import styles from './IssueCard.module.css';

type IssueCardProps = {
  id: string;
  index: number;
  title: string;
  type: 'task' | 'story' | 'bug';
  priority: 'low' | 'medium' | 'high';
  assigneeId: string | undefined;
  members: User<string>[];
  onClick?: () => void;
};

const typeIcons: Record<IssueCardProps['type'], React.ReactNode> = {
  task: <TaskIcon />,
  story: <StoryIcon />,
  bug: <BugIcon />,
};

const priorityIcons: Record<IssueCardProps['priority'], React.ReactNode> = {
  low: <LowPriorityIcon />,
  medium: <MediumPriorityIcon />,
  high: <HighPriorityIcon />,
};

function IssueCard({
  id,
  index,
  title,
  type,
  priority,
  assigneeId,
  members,
  onClick,
}: IssueCardProps) {
  const isMutating = useIsMutating();
  const isFetchingProject = useIsFetching({ queryKey: ['projects'] });

  const getAssignee = () => {
    if (!assigneeId) {
      return null;
    }
    return members.find((member) => member._id === assigneeId);
  };

  const assignee = getAssignee();

  const handleKeyDown = (e: KeyboardEvent) => {
    /*
    event has already been used for drag and drop:
    https://github.com/atlassian/react-beautiful-dnd/blob/master/docs/guides/how-we-use-dom-events.md
    */
    if (e.defaultPrevented) {
      return;
    }

    if (e.key === 'Enter' && onClick) {
      onClick();
    }
  };

  return (
    <Draggable
      draggableId={id}
      index={index}
      isDragDisabled={isMutating > 0 || isFetchingProject > 0}
    >
      {(provided, snapshot) => (
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions
        <div
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          className={styles.draggable}
          onClick={onClick}
          onKeyDown={handleKeyDown}
        >
          <Card
            shadow="xs"
            p={12}
            className={snapshot.isDragging ? styles.dragging : styles.card}
          >
            <div className={styles['issue-container']}>
              <p className={styles['issue-title']}>{title}</p>
              <div className={styles['issue-info']}>
                <Tooltip
                  label={`Type: ${capitalizeFirstLetter(type)}`}
                  withArrow
                  openDelay={300}
                  offset={2}
                >
                  <div className={styles.type}>{typeIcons[type]}</div>
                </Tooltip>
                <Tooltip
                  label={`Priority: ${capitalizeFirstLetter(priority)}`}
                  withArrow
                  openDelay={300}
                  offset={2}
                >
                  <div className={styles.priority}>
                    {priorityIcons[priority]}
                  </div>
                </Tooltip>
                {assignee && (
                  <Tooltip
                    label={`${assignee.firstName} ${assignee.lastName}`}
                    withArrow
                    openDelay={300}
                  >
                    <Avatar radius="xl" size={34} color="violet.7" ml="auto">
                      {getInitials(assignee.firstName, assignee.lastName)}
                    </Avatar>
                  </Tooltip>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </Draggable>
  );
}

export default IssueCard;
