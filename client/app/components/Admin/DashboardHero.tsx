import { FC } from "react"
import DashboardHeader from "./DashboardHeader"

type Props = {}
const DashboardHero: FC<Props> = (props: Props) => {
    return (
        <div>
            <DashboardHeader />
        </div>
    )
}
export default DashboardHero;